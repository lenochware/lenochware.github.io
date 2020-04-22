class Main extends NextGame {

	init()
	{
		super.init();
		this.canvas.width(800);
		this.canvas.height(600);

		this.shapes = [];

		this.selectedNode = null;

		this.offsetX = 0;
		this.offsetY = 0;

		this.grid = 10;

		this.cursor = {};
		this.origin = {x: 0, y: 0};
	}

	findNode(pos)
	{
		for(let shape of this.shapes)
		{
			let node = shape.findNode(pos);
			if (node) return node;
		}

		return null;
	}

	addShape(s, cursor)
	{
		s.getNode(cursor);
		
		if (this.selectedNode) {
			this.selectedNode.shape.color = 'green';
		}

		this.selectedNode = s.getNode(cursor);
		this.shapes.push(s);
		this.kb.key = '';		
	}

	drawGrid()
	{
		let height = this.canvas.height();
		let width = this.canvas.width();
		for(let y = 0; y < height; y += this.grid) {
			for(let x = 0; x < width; x += this.grid) {
				this.canvas.pixel(x, y, '#006');
			}
		}

		this.canvas.dashedLine(0, height / 2, width, height / 2, '#ccc');
		this.canvas.dashedLine(width / 2, 0, width / 2, height, '#ccc');
	}

	update()
	{
		this.requestUpdate();

		this.canvas.resetTransform();
		this.canvas.clear();

		this.canvas.text(30, 30, 'white', `(${this.cursor.x - this.origin.x}, ${this.cursor.y - this.origin.y})`);


		this.canvas.applyTransform();
		//this.canvas.context.rotate(40 * Math.PI / 180); DOMMatrix!
		this.drawGrid();

		for (let s of this.shapes) {
			s.draw(this.canvas);
			s.drawNodes(this.canvas);
		}

		this.cursor.x = Math.round((this.mouse.x - this.offsetX) / this.canvas.scale / this.grid) * this.grid;
		this.cursor.y = Math.round((this.mouse.y - this.offsetY) / this.canvas.scale / this.grid) * this.grid;
		this.canvas.circle(this.cursor.x, this.cursor.y, 2, 'purple');

		if (this.kb.key == 'l') this.addShape(new Line, this.cursor);
		if (this.kb.key == 'c') this.addShape(new Circle, this.cursor);
		if (this.kb.key == 'r') this.addShape(new Rect, this.cursor);
		if (this.kb.key == 's') this.addShape(new Spline, this.cursor);
		
		if (this.kb.key == 'o') {
			this.origin = Utils.clone(this.cursor);
			this.kb.key = '';
		}
		
		if (this.kb.key == 'Escape') {
			this.offsetX = this.offsetY = 0;
			this.canvas.offsetX = this.canvas.offsetY = 0;
			this.canvas.scale = 1;
			this.kb.key = '';
		};

		if (this.selectedNode) {
			this.selectedNode.x = this.cursor.x;
			this.selectedNode.y = this.cursor.y;
		}

		if(this.mouse.buttons) {
			if (this.selectedNode) {
				let s = this.selectedNode.shape;
				this.selectedNode = s.getNode(this.cursor);
				if (!this.selectedNode) s.color = 'green';
			}
			else {
				this.selectedNode = this.findNode(this.cursor);
				if (this.selectedNode) this.selectedNode.shape.color = 'red';
			}

			this.mouse.buttons = 0;
		}

		if (this.mouse.deltaY) {
			this.canvas.scale *= (this.mouse.deltaY > 0? 0.95 : 1.05 );
			this.mouse.deltaY = 0;
		}

		if (this.mouse.hold == this.MB_MIDDLE) {
			this.canvas.offsetX = this.offsetX + this.mouse.offsetX;
			this.canvas.offsetY = this.offsetY + this.mouse.offsetY;
		}

		if (this.mouse.release) {
			this.offsetX = this.canvas.offsetX;
			this.offsetY = this.canvas.offsetY;
			this.mouse.release = 0;
		}

		this.time = this.now();
	}
}


class Shape
{
	constructor()
	{
		this.nodes = [];
		this.color = 'red';
		this.maxNodes = 0;
	}

	getNode(pos)
	{
		if (this.nodes.length >= this.maxNodes) return null;
		let node = { shape: this, x: pos.x, y: pos.y	};
		this.nodes.push(node);
		return node;
	}

	findNode(pos)
	{
		for(let node of this.nodes)
		{
			if (node.x == pos.x && node.y == pos.y) return node;
		}

		return null;
	}


	drawNodes(canvas)
	{
		for (let node of this.nodes)
		{
			canvas.circlef(node.x, node.y, 2, '#9f9');
		}
	}

	draw(canvas)
	{
		throw Error('Abstract method.');
	}
}

class Line extends Shape
{
	constructor()
	{
		super();
		this.maxNodes = 2;
	}

	draw(canvas)
	{
		let p1 = this.nodes[0];
		let p2 = this.nodes[1];
		canvas.line(p1.x, p1.y, p2.x, p2.y, this.color);
	}

}

class Circle extends Shape
{
	constructor()
	{
		super();
		this.maxNodes = 2;
	}

	draw(canvas)
	{
		let p1 = this.nodes[0];
		let p2 = this.nodes[1];
		canvas.circle(p1.x, p1.y, Math.hypot(p2.x - p1.x, p2.y - p1.y) , this.color);		
		canvas.dashedLine(p1.x, p1.y, p2.x, p2.y, 'white');
	}
}

class Rect extends Shape
{
	constructor()
	{
		super();
		this.maxNodes = 2;
	}

	draw(canvas)
	{
		let p1 = this.nodes[0];
		let p2 = this.nodes[1];
		canvas.rect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y, this.color);
	}

}

class Spline extends Shape
{
	constructor()
	{
		super();
		this.maxNodes = 3;
	}

	draw(canvas)
	{
		let p1 = this.nodes[0];
		let p2 = this.nodes[1];

		canvas.dashedLine(p1.x, p1.y, p2.x, p2.y, 'white');

		if (this.nodes.length < 3) return;

		let p3 = this.nodes[2];

		canvas.dashedLine(p2.x, p2.y, p3.x, p3.y, 'white');
		canvas.spline([p1.x, p1.y, p2.x, p2.y, p3.x, p3.y], this.color);
	}

}