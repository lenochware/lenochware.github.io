class Main extends NextGame {

	init()
	{
		super.init();

		this.objects = [];
		this.objects.push(this.createSphere());
		this.objects.push(this.createCube());
		this.objects.push(this.createTwoCubes());
		this.objects.push(this.createTwoSpheres());

		this.view = {};

		this.paused = false;

		this.view.center = {
			x: Math.floor(this.canvas.width() / 2),
			y: Math.floor(this.canvas.height() / 2),
			z: 200
		};

		this.state = {
			obj: this.pickRandomObj(),
			next: this.pickRandomObj(),
			angleX: 0,
			angleY: 0,
			angleZ: 0,
			step: 0
		}

		this.view.scale = {x: 128, y: 128, z: 1};

		this.canvasImage = this.canvas.image();
	}

	pickRandomObj()
	{
		return this.objects[Utils.random(0, this.objects.length)];
	}


	createSphere()
	{
		let obj = [];

		const SEG = 12;

		for (let x=0; x<SEG; x++) for (let y=0; y<SEG; y++) for (let z=0; z<SEG; z++) {
			obj[z*SEG*SEG+y*SEG+x] = {
				x: Math.floor(80 * Math.sin((z+1)*Math.PI/(SEG+1)) * Math.sin((x+y*SEG)*2*Math.PI/(SEG**2))), 
				y: Math.floor(80 * Math.sin((z+1)*Math.PI/(SEG+1)) * Math.cos((x+y*SEG)*2*Math.PI/(SEG**2))), 
				z: Math.floor(80 * Math.cos((z+1)*Math.PI/(SEG+1)))
			}
		}

		return obj;
	}

	createCube()
	{
		let obj = [];

		const SEG = 12;

		for (let x=0; x<SEG; x++) for (let y=0; y<SEG; y++) for (let z=0; z<SEG; z++) {
			obj[z*SEG*SEG+y*SEG+x] = {
				x : Math.floor((SEG/2-x)*(120/SEG)-8), 
				y : Math.floor((SEG/2-y)*(120/SEG)-8), 
				z : Math.floor((SEG/2-z)*(120/SEG)-8)
			}
		}			

		return obj;
	}

	createTwoCubes()
	{
		let obj = [];

		const SEG = 12;		

		for (let x=0; x<SEG; x++) for (let y=0; y<SEG; y++) for (let z=0; z<SEG; z++) {
			if (x%2 == 0) {
				obj[z*SEG*SEG+y*SEG+x] = {
					x: Math.floor(70*x/SEG), 
					y: Math.floor(70*y/SEG), 
					z: Math.floor(70*z/SEG)
				}				
			}
			else {
				obj[z*SEG*SEG+y*SEG+x] = {
					x: -Math.floor(70*x/SEG), 
					y: -Math.floor(70*y/SEG), 
					z: -Math.floor(70*z/SEG)
				}
			}
		}			

		return obj;
	}

	createTwoSpheres()
	{
		let obj = [];

		const SEG = 12;			

		for (let x=0; x<SEG; x++) for (let y=0; y<SEG; y++) for (let z=0; z<SEG; z++) {
			if (x%2 == 0) {
				obj[z*SEG*SEG+y*SEG+x] = {
					x: 80+Math.floor(40*Math.sin((z+1)*Math.PI/(SEG+1))*Math.sin((x+y*SEG)*2*Math.PI/(SEG**2))), 
					y: Math.floor(40*Math.sin((z+1)*Math.PI/(SEG+1))*Math.cos((x+y*SEG)*2*Math.PI/(SEG**2))), 
					z: Math.floor(40*Math.cos((z+1)*Math.PI/(SEG+1)))
				}
			}
			else {
				obj[z*SEG*SEG+y*SEG+x] = {
					x: -80-Math.floor(40*Math.sin((z+1)*Math.PI/(SEG+1))*Math.sin((x+y*SEG)*2*Math.PI/(SEG**2))), 
					y: -Math.floor(40*Math.sin((z+1)*Math.PI/(SEG+1))*Math.cos((x+y*SEG)*2*Math.PI/(SEG**2))), 
					z: -Math.floor(40*Math.cos((z+1)*Math.PI/(SEG+1)))
				}
			}
		}	

		return obj;
	}

	putPixel(image, pos, color)
	{
		let v = this.view;
		
		let nx = v.center.x + Math.floor(pos.x * v.scale.x / (pos.z * v.scale.z + v.center.z));
		let ny = v.center.y + Math.floor(pos.y * v.scale.y / (pos.z * v.scale.z + v.center.z));
		
		// let nr=omez((r/2)-(z));
		// let ng=omez((g/2)-(z));
		// let nb=omez((b/2)-(z));
		
		image.putPixel(nx, ny, color);
	}

	sin(i)
	{
		return Math.sin(i * Math.PI / 1800);
	}

	cos(i)
	{
		return Math.cos(i * Math.PI / 1800);
	}

	fadeOut(image, percent)
	{
		for (let i = 0; i < image.data.length; i += 4)
		{
			image.data[i] *= percent;
		}
	}

	rotate(sourceObj, ax, ay, az)
	{
		let obj = [];

		let x,y,z;

		for (let i = 0; i < sourceObj.length; i++)
		{
			//rotace podle X
			y=Math.round(sourceObj[i].y*this.cos(ax)-sourceObj[i].z*this.sin(ax));
			z=Math.round(sourceObj[i].z*this.cos(ax)+sourceObj[i].y*this.sin(ax));			
			x=Math.round(sourceObj[i].x*this.cos(ay)-z*this.sin(ay));

			obj[i] = {
				x: Math.round(x*this.cos(az)-y*this.sin(az)),
				y: Math.round(y*this.cos(az)+x*this.sin(az)),
				z: Math.round(z*this.cos(ay)+sourceObj[i].x*this.sin(ay))
			}
		}
		
		return obj;
	}

	resize(srcObj, size)
	{
		let obj = [];

		for (let i = 0; i < srcObj.length; i++)
		{
			obj[i] = {x: srcObj[i].x * size, y: srcObj[i].y * size, z: srcObj[i].z * size}
		}

		return obj;
	}


	morph(a, b, t)
	{	
		let obj = [];

		for (let i = 0; i < a.length; i++)
		{						
			obj[i] = {
				x: Math.round(a[i].x + (b[i].x - a[i].x) * t),
				y: Math.round(a[i].y + (b[i].y - a[i].y) * t),
				z: Math.round(a[i].z + (b[i].z - a[i].z) * t)
			};
		}

		return obj;				
	}

	updateState()
	{
		let s = this.state;

		s.angleX = (s.angleX + 33) % 3600;
		s.angleY = (s.angleY + 21) % 3600;
		s.angleZ = (s.angleZ + 18) % 3600;
		s.step = (s.step + 1) % 400;

		if (s.step == 0) {
			s.obj = s.next;
			s.next = this.pickRandomObj();
		}
	}

	update()
	{
		this.requestUpdate();

		if (this.kb.key == 'p') {
			this.paused = !this.paused;
			this.kb.key = '';
		}

		if (this.paused) return;

		//this.canvas.clear();
		let im = this.canvasImage;
		let s = this.state;

		this.fadeOut(im, 0.8);

		//---
		let obj = s.obj;
		//obj = this.resize(obj, 1 + s.size / 100);

		if (s.step >= 200) {
			obj = this.morph(obj, s.next, (s.step - 200) / 200);
		}
		
		obj = this.rotate(obj, s.angleX, s.angleY, s.angleZ);

		for ( let i=0; i < obj.length; i++) {
			this.putPixel(im, obj[i], [255/*100 - obj[i].z */,0,0,255]);
		}

		this.canvas.image(im);

		this.updateState();

		this.canvas.text(20, 20, '#3f3', this.kb.key);

		if(this.mouse.buttons) {
			this.canvas.circle(this.mouse.x, this.mouse.y, 10, 'lime');
			this.mouse.buttons = 0;
		}

		this.time = this.now();
	}

}