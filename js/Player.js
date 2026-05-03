class PlayerImageManager {
	constructor() {
		this.idleFrames = Array.from({ length: 6 }, (_, i) => {
			const img = new Image();
			img.src = `imgs/Satyr_sprite_pack/idle_${i + 1}.png`;
			return { img, width: 115, height: 100 };
		});
		this.movingFrames = Array.from({ length: 8 }, (_, i) => {
			const img = new Image();
			img.src = `imgs/Satyr_sprite_pack/run_${i + 1}.png`;
			return { img, width: 115, height: 100 };
		});
		this.jumpingFrames = Array.from({ length: 3 }, (_, i) => {
			const img = new Image();
			img.src = `imgs/Satyr_sprite_pack/jump_${i + 1}.png`;
			return { img, width: 115, height: 100 };
		});
		this.fallingFrames = Array.from({ length: 3 }, (_, i) => {
			const img = new Image();
			img.src = `imgs/Satyr_sprite_pack/falling_${i + 1}.png`;
			return { img, width: 115, height: 100 };
		});
	}
}
export class Player {
	constructor(x, y, speed, gameTimeManager, keys) {
		this.x = x;
		this.y = y;
		this.speed = speed;
		this.keys = keys;

		this.controls = {
			right: "D".charCodeAt(0),
			left: "A".charCodeAt(0),
			up: " ".charCodeAt(0),
		};

		this.vx = 0;
		this.direction = 1;
		this.onGround = false;
		this.vy = 0;
		this.gameTimeManager = gameTimeManager;

		this.imageManager = new PlayerImageManager();
		this.state = 0;
		this.stateArray = [
			this.imageManager.idleFrames,
			this.imageManager.movingFrames,
			this.imageManager.jumpingFrames,
			this.imageManager.fallingFrames,
		];
		this.animTimer = 0;
		this.animFrame = 0;
		this.animFPS = 5;
	}
	updateAnimation() {
		this.animTimer += this.gameTimeManager.deltaTimeSeconds;
		if (this.animTimer >= 1 / this.animFPS) {
			this.animTimer = 0;
			this.animFrame =
				(this.animFrame + 1) % this.stateArray[this.state].length;
		}
	}
	updateState(newState, newFPS) {
		if (this.state !== newState) {
			this.state = newState;
			this.animFrame = 0;
			this.animTimer = 0;
		}
		this.animFPS = newFPS;
	}
	move() {
		let dx = 0;

		if (this.keys[this.controls.right]) {
			dx += 1;
		}
		if (this.keys[this.controls.left]) {
			dx -= 1;
		}
		this.vx = dx * this.speed;
		if (dx > 0) this.direction = 1;
		if (dx < 0) this.direction = -1;
		if (this.keys[this.controls.up] && this.onGround) {
			this.vy = -600;
			this.onGround = false;
		}
	}

	update(wW, wH) {
		this.move();
		if (this.vy < 0) {
			this.updateState(2, 5);
		} else if (this.vy > 0 && !this.onGround) {
			this.updateState(3, 5);
		} else if (this.vx) {
			this.updateState(1, 15);
		} else {
			this.updateState(0, 5);
		}
		this.updateAnimation();

		this.vy += 1200 * this.gameTimeManager.deltaTimeSeconds;

		this.x += this.vx * this.gameTimeManager.deltaTimeSeconds;
		this.y += this.vy * this.gameTimeManager.deltaTimeSeconds;

		this.x = Math.max(0, Math.min(wW, this.x));

		if (this.y + this.stateArray[this.state][this.animFrame].height / 2 >= wH) {
			this.y = wH - this.stateArray[this.state][this.animFrame].height / 2;
			this.vy = 0;
			this.onGround = true;
		} else {
			this.onGround = false;
		}
	}
	draw(renderer) {
		const img = this.stateArray[this.state][this.animFrame];
		renderer.drawSprite(
			img,
			this.x - img.width / 2,
			this.y - img.height / 2,
			this.direction,
		);
	}
}
