export class Camera {
	constructor() {
		this.x = 0;
	}

	follow(player, canvasWidth) {
		if (player.x > this.x + canvasWidth) {
			this.x += canvasWidth;
			player.x = this.x + 1;
		} else if (player.x < this.x) {
			this.x -= canvasWidth;
			player.x = this.x + canvasWidth - 1;
		}
	}
}
