//Empty template

class Main extends NextGame {

	init()
	{
		super.init();
		this.canvas.width(800);
		this.canvas.height(600);
		this.offset = 0;
		this.xoff = 0.01
		this.scene = 5;
	}

	update()
	{
		this.requestUpdate();
		this.canvas.clear();

		if (this.kb.key != 'p') this.offset += this.xoff;

		switch (this.scene) {
			case 1: this.renderMovingCircle(); break;
			case 2: this.renderGraph(); break;
			case 3: this.renderMGraph(); break;
			case 4: this.renderLines(); break;
			case 5: this.render2d(0.01); break;
			case 6: this.render2d(0.1); break;
		}

		if (this.kb.key == 'n') {
			if (++this.scene > 6) this.scene = 1;
			this.kb.key = '';
		};

		if (this.mouse.buttons) {
		}
		
		this.time = this.now();
	}

	renderGraph()
	{
		let base = 300;
		let width = this.canvas.width();

		let y = 0;

		let xoff = 0;
		for (let x = 0; x < width; x++)
		{
			y = Math.floor(base - Utils.perlin.noise(xoff + this.offset) * 200);
			this.canvas.line(x, y, x, base, 'lime');
			xoff += this.xoff;
		}
	}

	renderMGraph()
	{
		let base = 300;
		let width = this.canvas.width();

		let y = 0;

		let xoff = 0;
		for (let x = 0; x < width; x++)
		{
			y = Math.floor(base - Utils.perlin.noise(xoff, this.offset) * 200);
			this.canvas.line(x, y, x, base, 'lime');
			xoff += this.xoff;
		}
	}

	renderMovingCircle()
	{
		let x = Utils.perlin.noise(this.offset) * 300;
		let y = Utils.perlin.noise(this.offset + 10000) * 300;
		this.canvas.circlef(x + 200, y + 100, 30, 'yellow');
	}

	renderLines()
	{
		let im = this.canvas.image();
		let xoff = 0;

		for (let y = 0; y < 300; y++) {
			for (let x = 0; x < 400; x++) {
				let alpha = Utils.perlin.noise(xoff) * 255;
				im.putPixel(x, y, [255,255,255, alpha]);
				xoff += 0.01;
			}
		}
		
		this.canvas.image(im);
	}

	render2d(xoff)
	{
		let im = this.canvas.image();

		for (let y = 0; y < 300; y++) {
			for (let x = 0; x < 400; x++) {
				let alpha = Utils.perlin.noise(x * xoff, y * xoff) * 255;
				im.putPixel(x, y, [255,255,255, alpha]);
			}
		}
		
		this.canvas.image(im);
	}	
}