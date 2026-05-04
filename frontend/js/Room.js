import { EnemyManager } from "./Enemy.js";

export class Room {
	constructor(index, type, gameTimeManager, canvasWidth, canvasHeight) {
		this.index = index;
		this.type = type; // 'combat' | 'rest' | 'boss'
		this.visited = false;
		this.enemyManager = new EnemyManager(gameTimeManager);
		this.enemyManager.spawnCooldown = Infinity;

		if (type === "combat") {
			this.cleared = false;
			const count = 2 + Math.trunc(Math.random() * 4);
			const roomStartX = index * canvasWidth;
			for (let i = 0; i < count; i++) {
				const x =
					roomStartX + canvasWidth * 0.2 + Math.random() * canvasWidth * 0.6;
				this.enemyManager.spawn(
					this.enemyManager.avaliableEnemies[
						Math.trunc(
							Math.random() * this.enemyManager.avaliableEnemies.length,
						)
					],
					x,
					canvasHeight * 0.4,
				);
			}
		} else {
			this.cleared = true;
		}
	}

	update(wW, wH, player) {
		this.visited = true;
		this.enemyManager.update(wW, wH, player);
		if (!this.cleared && this.enemyManager.list.length === 0) {
			this.cleared = true;
		}
	}

	draw(renderer) {
		this.enemyManager.draw(renderer);
	}
}

export class RoomManager {
	constructor(gameTimeManager, canvasWidth, canvasHeight) {
		this.gameTimeManager = gameTimeManager;
		this.canvasWidth = canvasWidth;
		this.canvasHeight = canvasHeight;
		this.rooms = [];
		this.currentIndex = 0;
		this._generate(0);
		this.currentRoom = this.rooms[0];
	}
	get list() {
		return this.currentRoom.enemyManager.list;
	}

	_generate(index) {
		if (this.rooms[index]) return;
		let type;
		if (index === 0) type = "combat";
		else if (index % 5 === 0) type = "boss";
		else if (index % 3 === 0) type = "rest";
		else type = "combat";

		this.rooms[index] = new Room(
			index,
			type,
			this.gameTimeManager,
			this.canvasWidth,
			this.canvasHeight,
		);
	}

	advance() {
		this.currentIndex++;
		this._generate(this.currentIndex);
		this.currentRoom = this.rooms[this.currentIndex];
	}

	retreat() {
		if (this.currentIndex <= 0) return;
		this.currentIndex--;
		this.currentRoom = this.rooms[this.currentIndex];
	}

	update(wW, wH, player) {
		this.currentRoom.update(wW, wH, player);
	}

	draw(renderer) {
		this.currentRoom.draw(renderer);
	}
}
