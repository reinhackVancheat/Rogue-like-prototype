class EnemyImageManager {
	constructor(frames) {
		// frames: { idle: [{img, width, height}, ...], walk: [...], ... }
		this.stateArray = frames;
	}
}

export class Enemy {
	constructor(x, y, xVelocity, hp, gameTimeManager) {
		this.x = x;
		this.y = y;
		this.vy = 0;
		this.xVelocity = xVelocity;
		this.direction = xVelocity >= 0 ? 1 : -1;
		this.hp = { actual: hp, max: hp };
		this.gameTimeManager = gameTimeManager;

		this.state = 0;
		this.animFrame = 0;
		this.animTimer = 0;
		this.animFPS = 8;

		this.images = null;

		this.attackCooldown = 1;
		this.attackCooldownCount = 0;
		this.attackDuration = 0.6;
		this.attackDurationCount = 0;
		this.attacking = false;
		this.damage = 10;
		this.attackRange = 80;

		this.hurt = false;
		this.hurtTime = 0.6;
		this.hurtCount = 0;
	}
	isPlayerInRange(player) {
		return (
			Math.abs(this.x - player.x) < this.attackRange &&
			Math.abs(this.y - player.y) < 80
		);
	}

	tryAttack(player) {
		this.attackCooldownCount += this.gameTimeManager.deltaTimeSeconds;

		if (
			!this.attacking &&
			this.attackCooldownCount >= this.attackCooldown &&
			this.isPlayerInRange(player)
		) {
			this.attacking = true;
			this.attackCooldownCount = 0;
			this.attackDurationCount = this.attackDuration;
		}

		if (this.attacking) {
			this.attackDurationCount -= this.gameTimeManager.deltaTimeSeconds;
			if (
				this.attackDurationCount <= this.attackDuration / 2 &&
				!this.hasDealtDamage
			) {
				if (this.isPlayerInRange(player)) {
					player.takeDamage(this.damage);
				}
				this.hasDealtDamage = true;
			}

			if (this.attackDurationCount <= 0) {
				this.attacking = false;
				this.hasDealtDamage = false;
			}
		}
	}

	update(wW, wH, player) {
		if (this.isDead()) return;
		if (this.hurt) {
			this.hurtCount += this.gameTimeManager.deltaTimeSeconds;
		}
		if (this.hurtCount >= this.hurtTime) {
			this.hurt = false;
			this.hurtCount = 0;
		}
		this.updateAnimationState(player);
		this.updateAnimationSprite();
		this.applyPhysics(wW, wH);
		if (this.hurt) return;
		if (player) this.tryAttack(player);
	}
	updateState(newState, newFPS) {
		if (this.state !== newState) {
			this.state = newState;
			this.animFrame = 0;
			this.animTimer = 0;
		}
		this.animFPS = newFPS;
	}

	updateAnimationSprite() {
		const frames = this.images.stateArray[this.state];
		this.animTimer += this.gameTimeManager.deltaTimeSeconds;
		if (this.animTimer >= 1 / this.animFPS) {
			this.animTimer = 0;
			this.animFrame = (this.animFrame + 1) % frames.length;
		}
	}

	applyPhysics(_wW, wH) {
		this.vy += 1400 * this.gameTimeManager.deltaTimeSeconds;
		this.x +=
			this.xVelocity *
			this.gameTimeManager.deltaTimeSeconds *
			this.direction *
			!this.hurt;
		this.y += this.vy * this.gameTimeManager.deltaTimeSeconds;

		const frameHeight =
			this.images.stateArray[this.state][this.animFrame].height;
		const offset = this.groundOffsetY ?? 0;
		if (this.y + frameHeight / 2 - offset >= wH) {
			this.y = wH - frameHeight / 2 + offset;
			this.vy = 0;
		}
	}

	updateAnimationState() {}
	draw(renderer) {
		const img = this.images.stateArray[this.state][this.animFrame];
		renderer.drawSprite(
			img,
			this.x - img.width / 2,
			this.y - img.height / 2,
			this.direction,
		);
	}

	isDead() {
		return this.hp.actual <= 0;
	}

	takeDamage(player) {
		if (this.hurt) return;
		this.hp.actual = Math.max(0, this.hp.actual - player.damage);
		if (this.isDead()) {
			player.enemiesKilled++;
		}
		this.hurt = true;
	}
}

export class EnemyManager {
	constructor(gameTimeManager) {
		this.list = [];
		this.gameTimeManager = gameTimeManager;
		this.avaliableEnemies = [LizardGrunt, LizardCommander];
		this.spawnCooldown = 5;
		this.spawnCount = 0;
	}

	spawn(EnemyClass, x, y) {
		this.list.push(new EnemyClass(x, y, this.gameTimeManager));
	}
	update(wW, wH, player) {
		this.spawnCount += this.gameTimeManager.deltaTimeSeconds;
		if (this.spawnCount >= this.spawnCooldown) {
			this.spawnCount = 0;
			this.spawn(
				this.avaliableEnemies[
					Math.trunc(Math.random() * this.avaliableEnemies.length)
				],
				wW / 2,
				wH / 2,
			);
		}
		for (const enemy of this.list) {
			enemy.update(wW, wH, player);
		}
		this.list = this.list.filter((e) => !e.isDead());
	}

	draw(renderer) {
		for (const enemy of this.list) {
			enemy.draw(renderer);
		}
	}
}
class LizardGruntImageManager extends EnemyImageManager {
	constructor() {
		const load = (src, width, height) => {
			const img = new Image();
			img.src = src;
			return { img, width, height };
		};

		const base = "imgs/Enemies/Grunt/Spritesheets";

		super([
			Array.from({ length: 8 }, (_, i) =>
				load(`${base}/Idle/idle-${i + 1}.png`, 100, 100),
			),
			Array.from({ length: 8 }, (_, i) =>
				load(`${base}/Run/run-${i + 1}.png`, 100, 100),
			),
			Array.from({ length: 8 }, (_, i) =>
				load(`${base}/Attack/attack-${i + 1}.png`, 100, 100),
			),
			Array.from({ length: 4 }, (_, i) =>
				load(`${base}/Hurt/hurt-${i + 1}.png`, 100, 100),
			),
		]);
	}
}
export class LizardGrunt extends Enemy {
	constructor(x, y, gameTimeManager) {
		super(x, y, 60, 120, gameTimeManager);
		this.images = new LizardGruntImageManager();
	}

	updateAnimationState(player) {
		if (this.hurt) {
			this.updateState(3, 12);
		} else if (this.attacking) {
			this.updateState(2, 12);
		} else if (this.xVelocity !== 0) {
			this.updateState(1, 10);
		} else {
			this.updateState(0, 6);
		}
		if (player) {
			this.direction = player.x > this.x ? 1 : -1;
		}
	}
}

class LizardCommanderImageManager extends EnemyImageManager {
	constructor() {
		const load = (src, width, height) => {
			const img = new Image();
			img.src = src;
			return { img, width, height };
		};

		const base = "imgs/Enemies/Commander/Aseprite";

		super([
			Array.from({ length: 6 }, (_, i) =>
				load(`${base}/Idle/frame-${i + 1}.png`, 400, 400),
			),
			Array.from({ length: 8 }, (_, i) =>
				load(`${base}/Run/frame-${i + 1}.png`, 400, 400),
			),
			Array.from({ length: 11 }, (_, i) =>
				load(`${base}/Attack/frame-${i + 1}.png`, 400, 400),
			),
			Array.from({ length: 4 }, (_, i) =>
				load(`${base}/Hurt/frame-${i + 1}.png`, 400, 400),
			),
		]);
	}
}
export class LizardCommander extends Enemy {
	constructor(x, y, gameTimeManager) {
		super(x, y, Math.random() * 150 + 50, 500, gameTimeManager);
		this.images = new LizardCommanderImageManager();

		this.groundOffsetY = 120;
		this.damage = 100;
		this.attackCooldown = 3;
		this.attackRange = 200;
	}

	updateAnimationState(player) {
		if (this.hurt) {
			this.updateState(3, 12);
		} else if (this.attacking) {
			this.updateState(2, 12);
		} else if (this.xVelocity !== 0) {
			this.updateState(1, 10);
		} else {
			this.updateState(0, 6);
		}
		if (player) {
			this.direction = player.x > this.x ? 1 : -1;
		}
	}
}
