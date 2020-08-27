class Main extends NextGameGL {

	init()
	{
		super.init();
		//this.fullScreen();

		$('canvas').on('contextmenu', function(e){ return false; });

		this.raycaster = new THREE.Raycaster();
		this.selected = 0;
		this.level = {};
		this.changed = false;

		//this.setOrtho(20, 10);

		// (left, up, backward)
		this.camera.position.set(0, 4, 10);
		this.camera.lookAt(0, 0, 0);
		this.camera.rotation.order = "YXZ";

		const textureLoader = new THREE.TextureLoader();
		this.texture = textureLoader.load( 'images/dg_features32.gif' );
		this.texture.magFilter = THREE.NearestFilter;
		this.texture.minFilter = THREE.NearestFilter;
		//this.texture.anisotropy = 16;

		this.box = this.createBox();
		//const mat1 = new THREE.MeshLambertMaterial( { /*map: this.texture,*/ color: '#FFFFFF' } );
		this.material = new THREE.MeshLambertMaterial( { map: this.texture, color: '#FFFFFF' } );
		//const mat1 = new THREE.MeshBasicMaterial({vertexColors: THREE.FaceColors});

		this.createScene();
		this.addLights();
	}

	setTexture(m, idx)
	{
		 let w = 9;
		 let h = 13;

		 let u = idx % w / w;
		 let v = Math.floor(idx / w) / h;

		 let face = m.geometry.faceVertexUvs[0];
		 face[0][0].set(u, v);
		 face[0][1].set(u + 1/w, v + 1/h);
		 face[0][2].set(u, v + 1/h);
		 face[1][0].set(u, v);
		 face[1][1].set(u + 1/w, v);
		 face[1][2].set(u + 1/w, v + 1/h);

		 m.geometry.uvsNeedUpdate = true;

		 this.level[m.name] = {tex: idx};
		 this.changed = true;

	 // geometry.faceVertexUvs[0].push(
	 //  // front
	 //  [ new THREE.Vector2(u, v), new THREE.Vector2(u + 1/w, v + 1/h), new THREE.Vector2(u, v + 1/h) ],
	 //  [ new THREE.Vector2(u, v), new THREE.Vector2(u + 1/w, v), new THREE.Vector2(u + 1/w, v + 1/h) ],
	// );

	}

	createScene()
	{
		for(let y = 0; y < 10; y++) {
			for(let x = 0; x < 10; x++) {
				let m = new THREE.Mesh(this.box.ny.clone(), this.material);
				m.position.set(x - 5, 0, y - 5);
				m.name = Utils.key(x,y,'ny');
				let tex = (x == y)? 8 : 18;
				this.setTexture(m, tex);
				this.scene.add(m);
			}
		}

		this.addBlock(3, 3);
	}

	redrawLevel()
	{
		this.scene = new THREE.Scene();
		for(let key of Object.keys(this.level)) {
			let pos = key.split(',');
			let tex = this.level[key].tex;
			let m = new THREE.Mesh(this.box[pos[2]].clone(), this.material);
			m.position.set(pos[0] - 5, 0, pos[1] - 5);
			m.name = key;
			this.setTexture(m, tex);
			this.scene.add(m);
		}
		this.addLights();
	}

	addBlock(x, y)
	{
		for(let p of ['px', 'nx', 'pz', 'nz', 'py'])
		{
			let m = new THREE.Mesh(this.box[p].clone(), this.material);
			m.name = Utils.key(x,y,p);
			m.position.set(x - 5, 0, y - 5);
			this.setTexture(m, 12*9+2);
			this.scene.add(m);
		}
	}

	addLights()
	{
		//const am = new THREE.AmbientLight( 0x404040 ); // soft white light
		const am = new THREE.AmbientLight( 0xffffff ); // soft white light
		this.scene.add(am);
	}

	update()
	{
		this.requestUpdate();
			
		// if (!this.isPointerLock()) {
		// 	this.renderer.render( this.scene, this.camera );
		// 	return;
		// }

		if (this.kb.key.match(/\d/)) {
			let texture = [2*9, 7*9, 7*9+3, 9*9+3, 6*9+3, 11*9,  12*9+3, 5*9+1, 9+3, 8*9+3];
			console.log(Number(this.kb.key));
			this.selected = texture[Number(this.kb.key)];
			this.kb.key = '';
		}

		if (this.kbmap['ArrowUp']) {
			this.scene.rotation.x += 0.05;
		}

		if (this.kbmap['ArrowDown']) {
			this.scene.rotation.x -= 0.05;
		}

		if (this.kbmap['ArrowLeft']) {
			this.scene.rotation.y += 0.05;
		}

		if (this.kbmap['ArrowRight']) {
			this.scene.rotation.y -= 0.05;
		}

		if (this.kbmap['+']) {
			this.scene.position.z += 0.05;
		}

		if (this.kbmap['-']) {
			this.scene.position.z -= 0.05;
		}

		// key '/' repeats ad infimum?
		if (this.kbmap['z']) {
			this.camera.zoom += 0.05;
			this.camera.updateProjectionMatrix();
		}

		if (this.kbmap['Z']/* && this.kbmap['Shift']*/) {
			this.camera.zoom -= 0.05;
			this.camera.updateProjectionMatrix();
		}

		if (this.kb.key == 's') {
			localStorage.setItem('lev01', JSON.stringify(this.level));
			this.debugText('Level saved.');
		}

		if (this.kbmap['l']) {
			this.level = JSON.parse(localStorage.getItem('lev01'));
			this.debugText('Level loaded.');
			this.redrawLevel();
		}

		if (this.mouse.buttons == this.MB_LEFT)
		{
			let obj = this.mousePickObj();
			if (obj) {
				this.debugText(obj.name);
				this.setTexture(obj, this.selected);
			}
		}

		if (this.mouse.buttons == this.MB_RIGHT)
		{
			let obj = this.mousePickObj();
			let pos = obj? obj.name.split(',') : '';
			if (pos[2] == 'ny') this.addBlock(pos[0], pos[1]);
		}

		this.renderer.render( this.scene, this.camera );
		this.mouse.buttons = 0;
		this.kb.key = '';
	}

	mousePickObj()
	{
		let mousePos = {
			x : this.mouse.x / this.canvas.width * 2 - 1, 
			y: this.mouse.y / this.canvas.height * -2 + 1
		};

		this.raycaster.setFromCamera(mousePos, this.camera);
		// get the list of objects the ray intersected
		const intersectedObjects = this.raycaster.intersectObjects(this.scene.children);
		if (intersectedObjects.length) {
			return intersectedObjects[0].object;
		}
		else return null;
	}

	createPlane()
	{
		const geometry = new THREE.Geometry();
		geometry.vertices.push(
			new THREE.Vector3(-.5, -.5,  0),
			new THREE.Vector3( .5, -.5,  0),
			new THREE.Vector3(-.5,  .5,  0),
			new THREE.Vector3( .5,  .5,  0)
		);

		geometry.faces.push(
			new THREE.Face3(0, 3, 2),
			new THREE.Face3(0, 1, 3)
		);

		// geometry.faces[0].color =  new THREE.Color('red');
		// geometry.faces[1].color =  new THREE.Color('yellow');

		// geometry.faces[0].vertexColors = [
	 //    (new THREE.Color()).setHSL(0  , 1, 0.5),
	 //    (new THREE.Color()).setHSL(0.1, 1, 0.5),
	 //    (new THREE.Color()).setHSL(0.2, 1, 0.5),
	 //  ];

		geometry.faceVertexUvs[0].push(
			[ new THREE.Vector2(0, 0), new THREE.Vector2(0, 0), new THREE.Vector2(0, 0) ],
			[ new THREE.Vector2(0, 0), new THREE.Vector2(0, 0), new THREE.Vector2(0, 0) ],
		);
	 
		return geometry;
}

	createBox()
	{
		let box = {};

		box.px = this.createPlane();
		box.px.rotateY( Math.PI / 2 );
		box.px.translate( 0.5, 0, 0 );

		box.nx = this.createPlane();
		box.nx.rotateY( - Math.PI / 2 );
		box.nx.translate( -0.5, 0, 0 );

		box.py = this.createPlane();
		box.py.rotateX( - Math.PI / 2 );
		box.py.translate( 0, 0.5, 0 );

		box.ny = this.createPlane();
		// box.ny.rotateX( Math.PI / 2 );
		box.ny.rotateX( - Math.PI / 2 );
		box.ny.translate( 0, -0.5, 0 );

		box.pz = this.createPlane();
		box.pz.translate( 0, 0, 0.5 );

		box.nz = this.createPlane();
		box.nz.rotateY( Math.PI );
		box.nz.translate( 0, 0, -0.5 );		

		return box;
	}	
}