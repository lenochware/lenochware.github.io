class NextGameGL {

	constructor()
	{
		this.scene = null;
		this.camera = null;
		this.renderer = null;
		this.canvas = null;
		this.assets = {};

		this.mouse = null;
		this.kb = { key: ''};
		this.kbmap = {};

		this.MB_LEFT = 1;
		this.MB_RIGHT = 2;
		this.MB_MIDDLE = 4;

		this.startTime = this.now();
	}

	start()
	{
		this.preload();
		if (Utils.isEmpty(this.assets)) this.init();
		this.loadAssets(() => this.init());
	}

	preload()
	{
	}

	loadImage(id, url)
	{
		this.assets[id] = {id, url, type: 'image'};
	}

	loadText(id, url)
	{
		this.assets[id] = {id, url, type: 'text'};
	}

	loadAssets(callback)
	{
		let assetKeys = Object.keys(this.assets);
	  let count = assetKeys.length;
	  let onload = function() { if (--count == 0) callback(); };

	  for(let key of assetKeys) {
	  	let a = this.assets[key];
	  	switch (a.type) {
	  		case 'image':
 			    a.data = new Image();
			    a.data.addEventListener('load', onload);
			    a.data.src = this.assets[key].url;
			    break;
			  case 'text':
			  	fetch(a.url).then(response => response.text())
			  		.then(text => a.data = text)
			  		.then(onload);
			  break;
			  default : throw Error('Unknown asset type');
	  	}
	  }
	}

	init()
	{
		this.initKeyboard();
		this.initMouse();
		this.initThreeJs();

		$(this.canvas).on('mousedown', e => this.getMouseButtons(e));
		$(this.canvas).on('mouseup', e => this.mouseUp(e));
		$(this.canvas).on('mousemove', e => this.getMousePos(e));
		$(window).bind('wheel', e => this.getWheel(e));

		this.requestUpdate();
	}

	setOrtho(width, height)
	{
		this.camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2);		
	}

	now()
	{
		return Date.now();
	}

	time(delta = 0.0)
	{
		return (this.now() - this.startTime) / 1000 + delta;
	}

	initThreeJs()
	{
		this.scene = new THREE.Scene();
		
		this.camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 1000 );
		this.camera.position.z = 5;

		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.canvas = this.renderer.domElement;
		document.body.appendChild( this.canvas );
	}

	initKeyboard()
	{
		$("body").on('keydown', (e) => {
			this.kb = e;
			//this.kbmap[e.keyCode] = true;
		});


		$("body").on('keyup keydown', (e) => {
			this.kbmap[e.key] = e.type == 'keydown';
		});

	}

	initMouse()
	{
		this.mouse = {
			x: 0, y: 0,
			vx: 0, vy: 0,
			mx: 0, my: 0,
			buttons: 0, 
			deltaY: 0, 
			clickX: 0, clickY: 0, 
			offsetX: 0, offsetY: 0, 
			hold: 0,
			release: 0
		};
	}

	getMouseButtons(e)
	{
		this.mouse.buttons = e.buttons;
		this.mouse.clickX = this.mouse.x;
		this.mouse.clickY = this.mouse.y;
		this.mouse.hold = e.buttons;
	}

	mouseUp(e)
	{
		this.mouse.hold = 0;
		this.mouse.release = 1;
	}

	getWheel(e)
	{
		this.mouse.deltaY = e.originalEvent.deltaY;
	}

	getMousePos(e)
	{
    let scaleX = this.canvas.width / window.innerWidth;
    let scaleY = this.canvas.height / window.innerHeight;
    let m = this.mouse;

    m.mx = e.originalEvent.movementX;
    m.my = e.originalEvent.movementY;

    //pointer lock
    m.vx += m.mx;
    m.vy += m.my;
		
		m.x = Math.floor(e.offsetX * scaleX);
		m.y = Math.floor(e.offsetY * scaleY);

		if (m.hold) {
			m.offsetX = m.x - m.clickX;
			m.offsetY = m.y - m.clickY;
		}
		else {
			m.offsetX = m.offsetY = 0;
		}
	}

	fullScreen()
	{
		let that = this;
		this.canvas.onclick = function() {
		  that.canvas.requestPointerLock();
		};

		window.onresize = function() {
			that.windowResize();
		}
	}

	isPointerLock()
	{
		return (document.pointerLockElement === this.canvas);
	}

	windowResize()
	{
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize( window.innerWidth, window.innerHeight );		
	}

	requestUpdate()
	{
		window.requestAnimationFrame(tm => {
			this.update();
		});
	}

	update()
	{
	}

	debugText()
	{
		let s = '';
		for (let arg of arguments) {
			if (arg === null) {
				s += 'null';
				continue;
			}

			if (typeof arg === 'object') s += JSON.stringify(arg);
			else s += arg;
			s += ' ';
  	}
		
		$('#debug-box').html(s);
	}

}
