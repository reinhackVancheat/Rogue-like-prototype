export class Player {
	constructor(x, y, width, height, speed, gameTimeManager, keys) {
		this.x = x;
		this.y = y;
		this.speed = speed;
		this.keys = keys;
		this.width = width;
		this.height = height;

		this.controls = {
			right: "D".charCodeAt(0),
			left: "A".charCodeAt(0),
			up: " ".charCodeAt(0),
		};

		this.vx = 0;
		this.onGround = false;
		this.vy = 0;
		this.gameTimeManager = gameTimeManager;
	}

	move() {
		let dx = 0;

		if (this.keys[this.controls.right]) dx += 1;
		if (this.keys[this.controls.left]) dx -= 1;

		this.vx = dx * this.speed;

		if (this.keys[this.controls.up] && this.onGround) {
			this.vy = -600;
			this.onGround = false;
		}
	}

	update(wW, wH) {
		this.move();

		this.vy += 1200 * this.gameTimeManager.deltaTimeSeconds;

		this.x += this.vx * this.gameTimeManager.deltaTimeSeconds;
		this.y += this.vy * this.gameTimeManager.deltaTimeSeconds;

		this.x = Math.max(0, Math.min(wW, this.x));

		if (this.y + this.height / 2 >= wH) {
			this.y = wH - this.height / 2;
			this.vy = 0;
			this.onGround = true;
		} else {
			this.onGround = false;
		}
	}

	draw(renderer) {
		renderer.drawRectangle(
			this.x - this.width / 2,
			this.y - this.height / 2,
			this.width,
			this.height,
			"black",
		);
	}
}
