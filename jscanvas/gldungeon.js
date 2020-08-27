class Main extends NextGameGL {

	init()
	{
		super.init();
		//this.fullScreen();

		this.camera.rotation.order = "YXZ";
		this.camera.fov = 65;
		this.camera.updateProjectionMatrix();
		//this.camera.position.set(x, this.height, y);
		//this.camera.lookAt(0, 0.6, 0);

		this.light = null;
		this.level = this.level = JSON.parse(localStorage.getItem('lev01'));

		this.player = new Player(this, 0, 5);

		const textureLoader = new THREE.TextureLoader();
		this.texture = textureLoader.load( 'images/dg_features32.gif' );
		this.texture.magFilter = THREE.NearestFilter;
		this.texture.minFilter = THREE.NearestFilter;
		//this.texture.anisotropy = 16;

		this.box = this.createBox();
		this.material = new THREE.MeshLambertMaterial( { map: this.texture, color: '#FFFFFF' } );

		this.createScene();
	}

	createScene()
	{
		this.scene.background = new THREE.Color( 0x6666ff );

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


	addLights()
	{
		this.light = new THREE.PointLight(0xFFFFFF, 2, 6);
		this.light.position.copy(this.camera.position);
		//this.light.position.set(4, 3, 4);
		//this.scene.add(this.light);		

		let directionalLight = new THREE.DirectionalLight( 0x999999, 2 );
		directionalLight.position.set( 1, 1, 0.5 ).normalize();
		this.scene.add( directionalLight );

		const am = new THREE.AmbientLight( 0x333333 ); // soft white light
		this.scene.add(am);
	}

	update()
	{
		this.requestUpdate();

		//this.debugText(this.camera.rotation);

		//this.playerMove();
		this.player.update();


		this.renderer.render( this.scene, this.camera );
		this.light.position.copy(this.camera.position);

		this.mouse.mx = this.mouse.my = 0;
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

		geometry.faceVertexUvs[0].push(
			[ new THREE.Vector2(0, 0), new THREE.Vector2(0, 0), new THREE.Vector2(0, 0) ],
			[ new THREE.Vector2(0, 0), new THREE.Vector2(0, 0), new THREE.Vector2(0, 0) ],
		);

		geometry.computeFaceNormals();
	 
		return geometry;
}

	createBox()
	{
		let box = {};

		box.px = this.createPlane();
		box.px.rotateY( Math.PI / 2 );
		box.px.translate( 0.5, 0.5, 0 );

		box.nx = this.createPlane();
		box.nx.rotateY( - Math.PI / 2 );
		box.nx.translate( -0.5, 0.5, 0 );

		box.py = this.createPlane();
		box.py.rotateX( - Math.PI / 2 );
		box.py.translate( 0, 1, 0 );

		box.ny = this.createPlane();
		// box.ny.rotateX( Math.PI / 2 );
		box.ny.rotateX( - Math.PI / 2 );
		box.ny.translate( 0, 0, 0 );

		box.pz = this.createPlane();
		box.pz.translate( 0, 0.5, 0.5 );

		box.nz = this.createPlane();
		box.nz.rotateY( Math.PI );
		box.nz.translate( 0, 0.5, -0.5 );		

		return box;
	}	

}

class Player
{
	constructor(game, x, y)
	{
		this.game = game;
		this.camera = game.camera;
		this.height = 0.6;

		this.pos = new THREE.Vector3();
		this.setPos(x, y);
		this.rot = this.camera.rotation.y;
		this.lookingVec = this.getLookingVec(this.rot);
		//this.lookingVec = this.camera.getWorldDirection();

		this.moveAnimation = null;
	}

	startAnimation(id, duration)
	{
		this.moveAnimation = {id, duration, frame: 1};
	}

	playAnimation()
	{
		let anim = this.moveAnimation;
		if (!anim) return;

		anim.phase = anim.frame / anim.duration;

		switch (anim.id) {
			case 'moveForward': this.moveForward(); break;
			case 'moveBackward': this.moveForward(-1); break;
			case 'turnLeft': this.turnLeft(); break;
			case 'turnRight': this.turnLeft(-1); break;
			case 'bounceForward': this.bounce(.2); break;
			case 'bounceBackward': this.bounce(-.2); break;
		}

		anim.frame++;
		if (anim.frame > anim.duration) {
			this.moveAnimation = null;
		}

	}

	getLookingVec(rot)
	{
		return new THREE.Vector3( -Math.sin(rot), 0, 	-Math.cos(rot) );
	}

	moveForward(dir = 1)
	{	
		let anim = this.moveAnimation;
		let v = this.lookingVec.clone().multiplyScalar( dir * Utils.smoothStep(anim.phase) ).add(this.pos);
		this.camera.position.copy(v);

		if (anim.phase == 1) {
			this.setPos(v.x, v.z);
		}
	}

	bounce(dir = .2)
	{
		let anim = this.moveAnimation;
		let v = null;

		if (anim.phase < .5) {
			v = this.lookingVec.clone().multiplyScalar(dir * Utils.smoothStep(anim.phase) ).add(this.pos);
		}
		else {
			v = this.lookingVec.clone().multiplyScalar(dir * Utils.smoothStep(1 - anim.phase) ).add(this.pos);			
		}

		this.camera.position.copy(v);
	}

	canPass(dir)
	{
		let pos = this.lookingVec.clone().multiplyScalar(dir).add(this.pos);
		return !this.game.level[Utils.key(Math.round(pos.x)+5, Math.round(pos.z)+5, 'py')];
	}

	turnLeft(dir = 1)
	{
		let anim = this.moveAnimation;
		this.camera.rotation.y = this.rot + (dir * Utils.smoothStep(anim.phase) * Math.PI / 2);
		if (anim.phase == 1) {
			this.rot = this.camera.rotation.y;
			this.lookingVec = this.getLookingVec(this.rot);
		}
	}

	setPos(x, y)
	{
		this.pos.set(x, this.height, y);
		this.camera.position.set(x, this.height, y);
	}

	freeLook()
	{
		let rot = this.camera.rotation;
		rot.x -= (this.game.mouse.my / window.innerHeight) * Utils.TWO_PI;
		rot.y -= (this.game.mouse.mx / window.innerWidth) * Utils.TWO_PI;

		rot.x = Utils.clamp(this.camera.rotation.x, -1.5, 1.5);		
	}

	listenKeyboard()
	{
		let key = this.game.kb.key;

		if (key == 'ArrowUp') {
			if (this.canPass(1))
				this.startAnimation('moveForward', 20);
			else 
				this.startAnimation('bounceForward', 10);

			this.game.kb.key = '';
		}
		else if (key == 'ArrowDown') {
			if (this.canPass(-1))
				this.startAnimation('moveBackward', 20);
			else 
				this.startAnimation('bounceBackward', 10);

			this.game.kb.key = '';			
		}
		else if (key == 'ArrowLeft') {
			this.startAnimation('turnLeft', 15);
			this.game.kb.key = '';			
		}
		else if (key == 'ArrowRight') {
			this.startAnimation('turnRight', 15);
			this.game.kb.key = '';			
		}		
	}

	update()
	{
		let anim = this.moveAnimation;

		if (anim) this.playAnimation();
		else this.listenKeyboard();
	}

}