class Main extends NextGame {

	init()
	{
		super.init();
		this.canvas.fill('black');

		this.canvasImage = this.canvas.image();

		// canvas.fill('black');
		// canvas.rect(10,10,100,100, 'red');
		// canvas.rectf(110,110,200,100, 'blue');
		// canvas.pixel(400,300, 'green');
		// canvas.setFont("bold 18px monospace");
		// canvas.text(200,400, 'green', 'hoho!');
		// //canvas.circlef(400,200, 30, 'pink');
		// canvas.circle(400,200, 30, 'pink', 20);
	}

	fadeOut(image, percent)
	{
		for (let i = 0; i < image.data.length; i += 4)
		{
			image.data[i] *= percent;
		}
	}

	update()
	{
		let im = this.canvasImage;

		//console.log(this.elapsedTime);

		this.fadeOut(im, 0.95);

		for (let i = 0; i < 150; i++)
		{
			let x = Utils.random(0, this.canvas.width());
			let y = Utils.random(0, this.canvas.height());

			let index = (y * this.canvas.width() + x) * 4;

			im.data[index] = 255;
			im.data[index+3] = 255;
		}

		this.canvas.image(im);

		//this.canvas.text(20, 20, '#3f3', Utils.round(1000/this.elapsedTime, 2) + ' fps');
		this.canvas.text(20, 20, '#3f3', this.kb.key);

		if(this.mouse.buttons) {
			this.canvas.circle(this.mouse.x, this.mouse.y, 10, 'lime');
			this.mouse.buttons = 0;
		}

		this.requestUpdate();
	}

}
