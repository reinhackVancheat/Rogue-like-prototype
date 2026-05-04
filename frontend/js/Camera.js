export class Camera {
	constructor() {
		this.x = 0;
	}

	follow(player, canvasWidth, roomCleared) {
		if (player.x > this.x + canvasWidth) {
			if (roomCleared) {
				this.x += canvasWidth;
				player.x = this.x + 1;
				return 1; // avançou
			} else {
				player.x = this.x + canvasWidth - 1; // bloqueia
				return 0;
			}
		} else if (player.x < this.x) {
			this.x -= canvasWidth;
			player.x = this.x + canvasWidth - 1;
			return -1; // voltou
		}
		return 0;
	}
}
