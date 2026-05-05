import { Player } from "./Player.js";
import { RoomManager } from "./Room.js";

export class GameManager {
	constructor(renderer, gameTimeManager) {
		this.renderer = renderer;
		this.gameTimeManager = gameTimeManager;
	}
	draw(...objects) {
		for (const obj of objects) obj.draw(this.renderer);
	}
	update(...objects) {
		this.updateDeltaTime();
		const player = objects.find((o) => o instanceof Player);
		const roomManager = objects.find((o) => o instanceof RoomManager);
		const lifeBefore = player?.hp.actual;
		const platforms = roomManager?.currentRoom.platforms ?? [];

		player?.update(this.renderer.width, this.renderer.height, platforms);
		roomManager?.update(this.renderer.width, this.renderer.height, player);

		if (lifeBefore > player?.hp.actual) {
			console.log("shaking");
			this.renderer.shake(12, 0.3);
		}
	}
	updateDeltaTime() {
		const currentTime = performance.now();
		this.gameTimeManager.deltaTimeSeconds =
			(currentTime - this.gameTimeManager.lastTime) / 1000;
		this.gameTimeManager.lastTime = currentTime;
		if (this.gameTimeManager.deltaTimeSeconds > 0.16)
			this.gameTimeManager.deltaTimeSeconds = 0.16;
	}
}
