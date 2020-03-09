//Empty template

class Main extends NextGame {

	init()
	{
		super.init();
		this.canvas.width(800);
		this.canvas.height(600);

		this.screen = this.canvas.image();
		this.warp = new WarpTexture(this, 'lava');

		this.textures = Object.keys(this.assets);
		this.selected = 0;
	}

	preload()
	{
		this.loadImage('lava', 'images/lava.png');
		this.loadImage('lava2', 'images/lava2.png');
		this.loadImage('slime', 'images/slime.png');
		this.loadImage('portal', 'images/portal.png');
		this.loadImage('sparkle', 'images/sparkle.png');
	}

	update()
	{
		this.requestUpdate();

		//this.warp.scale = 1.5;
		this.warp.time += 0.01;
		this.warp.draw(this.screen, 80, 50, 300, 300);
		this.canvas.image(this.screen);
		this.canvas.text(10, 20, 'white', 'Press "n".');

		if (this.kb.key == 'n') {
			this.selected = (this.selected + 1) % this.textures.length;
			this.warp = new WarpTexture(this, this.textures[this.selected]);
			this.kb.key = '';
		};

		if (this.mouse.buttons) {
			this.mouse.buttons = 0;
		}
		
		this.time = this.now();
	}
}

class WarpTexture
{
	constructor(game, asset)
	{
		this.game = game;
		this.image = game.canvas.getImageData(game.assets[asset].data);
		this.scale = 1;
		this.time = 0;
	}

	warp(w) {
		return 10 * Math.sin(this.time + w/30);
	}

	draw(im, x0, y0, w, h)
	{
		for(let y = 0; y < h; y++) {
			for(let x = 0; x < w; x++) {

				let xin = Math.floor((x * this.scale + this.warp(y)) % this.image.width);
				let yin = Math.floor((y * this.scale + this.warp(x)) % this.image.height);

				if (xin < 0) xin += this.image.width;
				if (yin < 0) yin += this.image.height;

				let p = this.game.canvas.getPixel(this.image, xin, yin);
				im.putPixel(x + x0, y + y0, p);
			}
		}
	}
}