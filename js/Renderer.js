export class Renderer {
	constructor(canvas) {
		this.canvas = canvas;
		this.context = canvas.getContext("2d");
	}
	get width() {
		return this.canvas.width;
	}
	get height() {
		return this.canvas.height;
	}
	clear() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	drawRectangle(x, y, w, h, color) {
		this.context.fillStyle = color;
		this.context.fillRect(x, y, w, h);
	}
}
