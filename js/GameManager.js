export class GameManager {
	constructor(renderer, gameTimeManager) {
		this.renderer = renderer;
		this.gameTimeManager = gameTimeManager;
	}
	draw(...objects) {
		for (const obj of objects) {
			obj.draw(this.renderer);
		}
	}
	update(...objects) {
		this.updateDeltaTime();
		for (const obj of objects) {
			obj.update(this.renderer.width, this.renderer.height);
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
