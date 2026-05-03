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
	drawBackground() {
		for (const img of this.backgroundLayers) {
			this.context.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
		}
	}
}
