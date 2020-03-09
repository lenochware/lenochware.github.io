class Main extends NextGame {

	init()
	{
		super.init();
		this.canvas.width(800);
		this.canvas.height(600);

		this.offsetX = 0;
		this.offsetY = 0;		
	}

	preload()
	{
		this.loadImage('tiles', 'images/tiles.png');		
	}

	update()
	{
		this.requestUpdate();

		this.canvas.resetTransform();
		this.canvas.clear();
		this.canvas.applyTransform();

		let tileSet = new Tileset(this, this.assets.tiles, 16, 4);

		for (let y = 0; y < 20; y++) {
			for(let x = 0; x < 40; x++) {
				
				let worldX = x - Math.floor(this.canvas.offsetX / tileSet.tileWidth / this.canvas.scale) - 1;
				let worldY = y - Math.floor(this.canvas.offsetY / tileSet.tileHeight / this.canvas.scale) - 1;

				Utils.seed = (worldY << 16) + worldX;
				tileSet.draw(Utils.seedRandom(1, tileSet.size - 1), worldX * tileSet.tileWidth, worldY * tileSet.tileHeight);
			}
		}

		if (this.kb.key == 'Escape') {
			this.offsetX = this.offsetY = 0;
			this.canvas.offsetX = this.canvas.offsetY = 0;
			this.canvas.scale = 1;
			this.kb.key = '';
		};

		if (this.mouse.deltaY) {
			this.canvas.scale *= (this.mouse.deltaY > 0? 0.95 : 1.05 );
			this.mouse.deltaY = 0;
		}		

		if (this.mouse.hold == this.MB_LEFT) {
			this.canvas.offsetX = this.offsetX + this.mouse.offsetX;
			this.canvas.offsetY = this.offsetY + this.mouse.offsetY;
		}

		if (this.mouse.release) {
			this.offsetX = this.canvas.offsetX;
			this.offsetY = this.canvas.offsetY;
			this.mouse.release = 0;
		}

		let worldX =  - Math.floor(this.canvas.offsetX / tileSet.tileWidth / this.canvas.scale) - 1;
		let worldY =  - Math.floor(this.canvas.offsetY / tileSet.tileHeight / this.canvas.scale) - 1;

		this.canvas.resetTransform();
		
		this.canvas.text(10, 20, 'white', worldX + ', ' + worldY + ', ' + ((worldY << 16) + worldX));
		//this.canvas.text(10, 20, 'white', this.canvas.offsetX + ', ' + this.canvas.offsetY + ', ' + this.canvas.scale);

		
		this.time = this.now();
	}
}

class Tileset
{
	constructor(game, asset, x, y)
	{
		this.canvas = game.canvas;
		this.image = asset.data;
		this.size = x * y;
		this.x = x;
		this.y = y;
		this.tileWidth = Math.floor(this.image.width / x);
		this.tileHeight = Math.floor(this.image.height / y);
	}

	draw(ti, dx, dy)
	{
		let sx = ti % this.x * this.tileWidth;
		let sy = Math.floor(ti / this.x) * this.tileHeight;
		this.canvas.context.drawImage(this.image, sx, sy, this.tileWidth, this.tileHeight, dx, dy, this.tileWidth, this.tileHeight);
	}
}
