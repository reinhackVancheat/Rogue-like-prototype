export class Renderer {
	constructor(canvas) {
		this.canvas = canvas;
		this.context = canvas.getContext("2d");

		const srcs = [
			"imgs/Forest_asset_pack/1_Parallax/1_Trees_Background.png",
			"imgs/Forest_asset_pack/1_Parallax/2_Trees.png",
			"imgs/Forest_asset_pack/1_Parallax/3_Trees.png",
			"imgs/Forest_asset_pack/1_Parallax/4_Trees.png",
		];

		this.backgroundLayers = srcs.map((src) => {
			const img = new Image();
			img.src = src;
			return img;
		});
		this.portrait = new Image();
		this.portrait.src = "imgs/Satyr_sprite_pack/SPRITE_PORTRAIT.png";

		this.shakeIntensity = 0;
		this.shakeDuration = 0;
	}
	get width() {
		return this.canvas.width;
	}
	get height() {
		return this.canvas.height;
	}
	loadAssets() {
		return Promise.all(
			this.backgroundLayers.map(
				(img) =>
					new Promise((resolve, reject) => {
						if (img.complete) resolve();
						else {
							img.onload = resolve;
							img.onerror = reject;
						}
					}),
			),
		);
	}
	clear() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
	drawSprite(img, x, y, direction) {
		this.context.save();
		const cx = x + img.width / 2;
		const _cy = y + img.height / 2;
		this.context.translate(cx, 0);
		this.context.scale(direction, 1);
		this.context.drawImage(img.img, -img.width / 2, y, img.width, img.height);
		this.context.restore();
	}

	applyCamera(cameraX) {
		const dx =
			this.shakeDuration > 0
				? (Math.random() - 0.5) * 2 * this.shakeIntensity
				: 0;
		const dy =
			this.shakeDuration > 0
				? (Math.random() - 0.5) * 2 * this.shakeIntensity
				: 0;
		this.context.save();
		this.context.translate(-cameraX + dx, dy);
	}

	resetCamera() {
		this.context.restore();
	}

	drawBackground(cameraX = 0) {
		const w = this.canvas.width;
		const h = this.canvas.height;
		const speeds = [0.05, 0.15, 0.35, 0.6];

		for (let i = 0; i < this.backgroundLayers.length; i++) {
			const offset = (((-cameraX * speeds[i]) % w) + w) % w;
			this.context.drawImage(this.backgroundLayers[i], offset, 0, w, h);
			this.context.drawImage(this.backgroundLayers[i], offset - w, 0, w, h);
		}
	}
	drawHud(player, roomManager) {
		this.context.drawImage(this.portrait, 20, 20, 155, 140);
		this.context.fillStyle = "black";
		this.context.font = "70px Roboto";
		this.context.textAlign = "left";
		this.context.fillText(`Kills: ${player.enemiesKilled}`, 180, 90, 140);
		this.context.fillText(`Room: ${roomManager.currentIndex}`, 180, 150, 140);

		this.context.textAlign = "center";
		this.context.fillText(
			`Type: ${roomManager.currentRoom.type}`,
			this.canvas.width / 2,
			90,
		);
		this.context.fillStyle = "red";
		this.context.fillRect(
			20,
			170,
			155 * (player.hp.actual / player.hp.max),
			16,
		);
		this.context.strokeStyle = "black";
		this.context.strokeRect(20, 170, 155, 16);
	}

	shake(intensity = 10, duration = 0.3) {
		this.shakeIntensity = intensity;
		this.shakeDuration = duration;
	}
	update(deltaTime) {
		if (this.shakeDuration > 0) {
			this.shakeDuration -= deltaTime;
		} else {
			this.shakeIntensity = 0;
		}
	}
}
