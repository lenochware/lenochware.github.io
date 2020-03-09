class NextCanvas
{
	constructor(canvasId)
	{
		this.id = canvasId;
		this.element = document.getElementById(canvasId);
		this.context = this.element.getContext('2d');
		if (!this.context) throw Error('Canvas not found.');

		this.offsetX = 0;
		this.offsetY = 0;
		this.scale = 1;
	}

	//this.context.save();
	//this.context.restore();

	on(eventName, f)
	{
		$('#' + this.id).on(eventName, f);
	}

	clear()
	{
		this.context.clearRect(0, 0, this.width(), this.height());
		return this;
	}

	resetTransform()
	{
		this.context.setTransform(1, 0, 0, 1, 0, 0);
	}

	applyTransform()
	{
		this.context.setTransform(this.scale, 0, 0, this.scale, this.offsetX, this.offsetY);
	};


	width(num)
	{
		if (num) {
			this.context.canvas.width = num;
		}

		return this.context.canvas.width;
	}

	height(num)
	{
		if (num) {
			this.context.canvas.height = num;
		}

		return this.context.canvas.height;
	}

	screenWidth()
	{
		let r = this.element.getBoundingClientRect();
		return r.width;
	}

	screenHeight()
	{
		let r = this.element.getBoundingClientRect();
		return r.height;
	}

	fill(style = '#000')
	{
		this.context.fillStyle = style;
		this.context.fillRect(0, 0, this.width(), this.height());
		return this;
	}

	image(im)
	{
		if (im) {
			this.context.putImageData(im, 0, 0);
		}
		else {
			let im = this.context.getImageData(0, 0, this.width(), this.height());
			im.getPixel = (x, y) => this.getPixel(im, x, y);
			im.putPixel = (x, y, pixel) => this.putPixel(im, x, y, pixel);
			return im;
		}
	}

	setLine(width)
	{
		if (!width) {
			this.context.lineWidth = this.prevLineWidth;
		}

		this.prevLineWidth = this.context.lineWidth;
		this.context.lineWidth = width;
		//this.ctx.setLineDash(dash);
		return this;
	}

	rect(x, y, w, h, style, lineWidth = 1)
	{
		this.setLine(lineWidth);

		this.context.strokeStyle = style;
		this.context.beginPath();
		this.context.rect(x, y, w, h);
		this.context.stroke();

		this.setLine(null);

		return this;
	}

	rectf(x, y, w, h, style)
	{
		this.context.fillStyle = style;
		this.context.fillRect(x, y, w, h);
		return this;
	}

	pixel(x, y, color)
	{
		this.rectf(x, y, 1, 1, color);
		return this;
	}

	getPixel(im, x, y)
	{
		if (x < 0 || y < 0 || x > im.width-1 || y > im.height-1) {
			return [0,0,0,0];
		}

		let i = (y * im.width + x) * 4;
		return [im.data[i], im.data[i+1], im.data[i+2], im.data[i+3]];
	}

	putPixel(im, x, y, pixel)
	{
		if (x < 0 || y < 0 || x > im.width-1 || y > im.height-1) return;

		let i = (y * im.width + x) * 4;

		im.data[i] = pixel[0];
		im.data[i+1] = pixel[1];
		im.data[i+2] = pixel[2];
		im.data[i+3] = pixel[3];
	}

	getImageData(htmlImg)
	{
		const canvas = document.createElement('canvas');
		canvas.width = htmlImg.width;
		canvas.height = htmlImg.height;
		canvas.getContext('2d').drawImage(htmlImg, 0, 0, htmlImg.width, htmlImg.height);
		return canvas.getContext('2d').getImageData(0, 0, htmlImg.width, htmlImg.height);
	}


	setFont(font)
	{
		this.context.font = font;
	}

	scale(x, y)
	{
		this.context.scale(x, y);
	}

	text(x, y, color, s)
	{
		this.context.fillStyle = color;
		this.context.fillText(s, x, y); 
	}

	ellipse(x, y, rx, ry, style, lineWidth = 1)
	{
		this.setLine(lineWidth);

		this.context.strokeStyle = style;
		this.context.beginPath();
		this.context.ellipse(x, y, rx, ry, 0, 0, Math.PI*2);
		this.context.closePath();
		this.context.stroke();

		this.setLine(null);

		return this;
	}

	ellipsef(x, y, rx, ry, style)
	{
		this.context.fillStyle = style;
		this.context.beginPath();
		this.context.ellipse(x, y, rx, ry, 0, 0, Math.PI*2);
		this.context.closePath();
		this.context.fill();

		return this;
	}

	circle(x, y, r, style, lineWidth = 1)
	{
		this.ellipse(x, y, r, r, style, lineWidth);
	}

	circlef(x, y, r, style)
	{
		this.ellipsef(x, y, r, r, style);
	}

	dashedLine(x1, y1, x2, y2, style, lineWidth = 1)
	{
		this.context.setLineDash([5,5]);
		this.polyline([x1, y1, x2, y2], style, lineWidth);
		this.context.setLineDash([]);
	}

	line(x1, y1, x2, y2, style, lineWidth = 1)
	{
		this.polyline([x1, y1, x2, y2], style, lineWidth);
	}

	polyline(points, style, lineWidth = 1)
	{
		this.setLine(lineWidth);

		this.context.strokeStyle = style;
		this.context.beginPath();
		this.context.moveTo(points[0], points[1]);

		for(let i = 2; i < points.length; i += 2) {
			this.context.lineTo(points[i], points[i + 1]);
		}

		this.context.stroke();

		this.setLine(null);

		return this;
	}

	polygon(points, style)
	{
		this.context.strokeStyle = style;		
		this.context.beginPath();
		this.context.moveTo(points[0], points[1]);

		for(let i = 2; i < points.length; i += 2) {
			this.context.lineTo(points[i], points[i + 1]);
		}
	
		this.context.closePath();
		this.context.stroke();

		return this;
	}

	polygonf(points, style)
	{
		this.context.fillStyle = style;		
		this.context.beginPath();
		this.context.moveTo(points[0], points[1]);

		for(let i = 2; i < points.length; i += 2) {
			this.context.lineTo(points[i], points[i + 1]);
		}
	
		this.context.closePath();
		this.context.fill();

		return this;
	}

	spline(points, style, lineWidth = 1)
	{
		this.setLine(lineWidth);

		this.context.strokeStyle = style;
		this.context.beginPath();
		this.context.moveTo(points[0], points[1]);

		for (var i = 2; i < points.length - 4; i += 2)
		{
				var xc = (points[i] + points[i + 2]) / 2;
				var yc = (points[i + 1] + points[i + 3]) / 2;
				this.context.quadraticCurveTo(points[i], points[i + 1], xc, yc);
		}
		// curve through the last two points
		this.context.quadraticCurveTo(points[i], points[i+1], points[i+2], points[i+3]);

		//if (closed) this.context.closePath();

		this.context.stroke();
		this.setLine(null);

		return this;
	}	

}