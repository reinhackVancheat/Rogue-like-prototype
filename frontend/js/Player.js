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
		this.attackFrames = Array.from({ length: 7 }, (_, i) => {
			const img = new Image();
			img.src = `imgs/Satyr_sprite_pack/attack-${i + 1}.png`;
			return { img, width: 115, height: 100 };
		});
		this.hurtFrames = Array.from({ length: 4 }, (_, i) => {
			const img = new Image();
			img.src = `imgs/Satyr_sprite_pack/hurt_${i + 1}.png`;
			return { img, width: 115, height: 100 };
		});
		this.dashFrames = Array.from({ length: 6 }, (_, i) => {
			const img = new Image();
			img.src = `imgs/Satyr_sprite_pack/dash_${i + 1}.png`;
			return { img, width: 115, height: 100 };
		});
	}
}
export class Player {
	constructor(x, y, speed, gameTimeManager, keys, enemies, hp) {
		this.x = x;
		this.y = y;
		this.speed = speed;
		this.keys = keys;
		this.enemies = enemies;
		this.controls = {
			right: "D".charCodeAt(0),
			left: "A".charCodeAt(0),
			up: " ".charCodeAt(0),
			attack: "E".charCodeAt(0),
			dash: "Q".charCodeAt(0),
		};
		this.hp = {
			max: hp,
			actual: hp,
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
			this.imageManager.attackFrames,
			this.imageManager.hurtFrames,
			this.imageManager.dashFrames,
		];
		this.animTimer = 0;
		this.animFrame = 0;
		this.animFPS = 5;

		this.attacking = false;
		this.attackingCooldown = 0.5;
		this.attackingCooldownCount = 0;
		this.attackingDuration = 0.5;
		this.damage = 40;

		this.enemiesKilled = 0;

		this.hurt = false;
		this.hurtTime = 0.6;
		this.hurtTimeCount = 0;

		this.dashing = false;
		this.dashDuration = 0.2;
		this.dashDurationCount = 0;
		this.dashCooldown = 0.8;
		this.dashCooldownCount = 0;
		this.dashSpeed = 1600;
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

		if (this.keys[this.controls.right] && !this.dashing) {
			dx += 1;
		}
		if (this.keys[this.controls.left] && !this.dashing) {
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
	takeDamage(amount) {
		if (this.hurt) return;
		this.hp.actual = Math.max(0, this.hp.actual - amount);
		this.hurt = true;
	}
	isDead() {
		return this.hp.actual <= 0;
	}
	dash() {
		this.dashCooldownCount += this.gameTimeManager.deltaTimeSeconds;

		if (
			this.keys[this.controls.dash] &&
			!this.dashing &&
			this.dashCooldownCount >= this.dashCooldown
		) {
			this.dashing = true;
			this.dashDurationCount = 0;
			this.dashCooldownCount = 0;
		}

		if (this.dashing) {
			this.vx = this.direction * this.dashSpeed;
			this.vy = 0; // opcional: cancela gravidade durante o dash
			this.dashDurationCount += this.gameTimeManager.deltaTimeSeconds;
			if (this.dashDurationCount >= this.dashDuration) {
				this.dashing = false;
			}
		}
	}
	attack(enemies = []) {
		this.attackingCooldownCount += this.gameTimeManager.deltaTimeSeconds;

		if (
			this.keys[this.controls.attack] &&
			!this.attacking &&
			this.attackingCooldownCount >= this.attackingCooldown
		) {
			this.attacking = true;
			this.attackingCooldownCount = 0;
			this.attackingDuration = 0.4;
			this.hitEnemies = new Set();
		}

		if (this.attacking) {
			this.attackingDuration -= this.gameTimeManager.deltaTimeSeconds;

			const hitbox = this.getAttackHitbox();
			for (const enemy of enemies) {
				if (this.hitEnemies.has(enemy)) continue;
				if (this.rectsOverlap(hitbox, enemy)) {
					enemy.takeDamage(this);
					this.hitEnemies.add(enemy);
				}
			}

			if (this.attackingDuration <= 0) {
				this.attacking = false;
			}
		}
	}

	manageState() {
		if (this.hurt) {
			this.updateState(5, 13);
		} else if (this.attacking) {
			this.updateState(4, 20);
		} else if (this.dashing) {
			this.updateState(6, 15);
		} else if (this.vy < 0) {
			this.updateState(2, 5);
		} else if (this.vy > 0 && !this.onGround) {
			this.updateState(3, 5);
		} else if (this.vx) {
			this.updateState(1, 15);
		} else {
			this.updateState(0, 5);
		}
	}

	update(_wW, wH, platforms = []) {
		if (this.isDead()) return;
		if (this.hurt) {
			this.vx = 0;
			this.hurtTimeCount += this.gameTimeManager.deltaTimeSeconds;
			if (this.hurtTimeCount >= this.hurtTime) {
				this.hurt = false;
				this.hurtTimeCount = 0;
			}
		} else {
			this.move();
			this.attack(this.enemies.list);
		}
		this.dash();
		this.manageState();
		this.updateAnimation();

		this.vy += 1200 * this.gameTimeManager.deltaTimeSeconds;

		this.x += this.vx * this.gameTimeManager.deltaTimeSeconds;

		this.y += this.vy * this.gameTimeManager.deltaTimeSeconds;

		if (this.y + this.stateArray[this.state][this.animFrame].height / 2 >= wH) {
			this.y = wH - this.stateArray[this.state][this.animFrame].height / 2;
			this.vy = 0;
			this.onGround = true;
		} else {
			this.onGround = false;
		}
		const frameHeight = this.stateArray[this.state][this.animFrame].height;
		for (const platform of platforms) {
			if (
				platform.resolveCollision(
					this,
					frameHeight,
					this.gameTimeManager.deltaTimeSeconds,
				)
			) {
				this.onGround = true;
			}
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
	rectsOverlap(a, enemy) {
		const b = {
			x: enemy.x - 30,
			y: enemy.y - 50,
			width: 60,
			height: 100,
		};
		return (
			a.x < b.x + b.width &&
			a.x + a.width > b.x &&
			a.y < b.y + b.height &&
			a.y + a.height > b.y
		);
	}
	getAttackHitbox() {
		const w = 60;
		const h = 50;
		const offsetX = this.direction === 1 ? this.x : this.x - w;
		return {
			x: offsetX,
			y: this.y - h / 2,
			width: w,
			height: h,
		};
	}
}
