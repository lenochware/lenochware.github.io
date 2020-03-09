class Main extends NextGame {

	init()
	{
		super.init();
		this.canvasImage = this.canvas.image();
	}


	update()
	{
		let im = this.canvasImage;

		//Utils.seed = 123456;


		for (let y = 0; y < im.height; y++)
		{
			for (let x = 0; x < im.width; x++)
			{
				Utils.seed = y * im.width + x;
				im.putPixel(x, y, this.randomPixel());
			}
		}

		this.canvas.image(im);

		this.canvas.text(20, 20, '#3f3', this.kb.key);

		if(this.mouse.buttons) {
			this.canvas.circle(this.mouse.x, this.mouse.y, 10, 'lime');
			this.mouse.buttons = 0;
		}

		this.requestUpdate();
	}

	randomPixel()
	{
		return [
			Utils.seedRandom(200,255),
			Utils.seedRandom(50,200),
			Utils.seedRandom(50,100),
			255
		];
	}

}
