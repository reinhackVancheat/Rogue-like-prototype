export class Camera {
	constructor() {
		this.x = 0;
	}
	follow(player, canvasWidth, roomManager) {
		const roomCleared = roomManager.currentRoom.cleared;
		if (player.x > this.x + canvasWidth) {
			if (roomCleared) {
				this.x += canvasWidth;
				player.x = this.x + 1;
				return 1;
			} else {
				player.x = this.x + canvasWidth - 1;
				return 0;
			}
		} else if (player.x < this.x && roomManager.currentIndex > 0) {
			this.x -= canvasWidth;
			player.x = this.x + canvasWidth - 1;
			return -1;
		}
		return 0;
	}
}
