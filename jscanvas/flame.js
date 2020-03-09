class Main extends NextGame {

	init()
	{
		super.init();
		this.fullScreen();
		this.canvasImage = this.canvas.image();
	}

	fullScreen()
	{
		this.canvas.width(200);
		this.canvas.height(Math.floor($(window).height() / $(window).width() * 200));
	}


	update()
	{
		this.requestUpdate();

		//if (this.now() - this.time < 30) return;

		let im = this.canvasImage;

		//console.log(this.elapsedTime);

		for (let x = 0; x < im.width; x++)
		{
			im.putPixel(x, im.height -1 , this.randomPixel());
		}

		let w = im.width, h = im.height;


		for (let y = 0; y < im.height - 1; y++)
		{
			for (let x = 0; x < im.width; x++)
			{
				let a = im.getPixel((x - 1 + w) % w, (y + 1) % h);
				let b = im.getPixel(x , (y + 1) % h);
				let c = im.getPixel((x + 1) % w, (y + 1) % h);
				let d = im.getPixel(x, (y + 2) % h);

				im.putPixel(x, y, this.avg(a, b, c, d));
			}
		}


		this.canvas.image(im);

		this.canvas.text(20, 20, '#3f3', this.kb.key);

		if(this.mouse.buttons) {
			this.canvas.circle(this.mouse.x, this.mouse.y, 10, 'lime');
			this.mouse.buttons = 0;
		}

		this.time = this.now();
	}

	avg(a, b, c, d)
	{
		for(let i = 0; i < 3; i++) {
			a[i] = Math.floor((a[i] + b[i] + c[i] + d[i]) / 4.03);
		}

		return a;
	}

	rgbToInt(pixel)
	{
		return (pixel[0] << 16) + (pixel[1] << 8) + pixel[2];

	}

	intToRgb(color)
	{
		return [
   		(color >> 16) & 255,
    	(color >> 8) & 255,
     	color & 255,
     	255
		];
	}

	randomPixel()
	{
		//if (Math.random() < 0.5) return [0,255,0,255];

		return [
			Utils.random(100,255),
			Utils.random(10,200),
			Utils.random(10,100),
			255
		];
	}

}
