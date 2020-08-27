const CHUNK_SIZE = 16;
const HEIGHT_MAX = 20;
const HEIGHT_MIN = -10;

class Main extends NextGameGL {
	
	preload()
	{
		this.loadText('vertexShader', 'shaders/sky.vert');
		this.loadText('fragmentShader', 'shaders/sky.frag');
	}

	init()
	{
		super.init();
		this.fullScreen();

		this.cpos = {x:0, z:0};
		this.chunks = {};

		const loader = new THREE.TextureLoader();

		this.assets.basicMaterial = new THREE.MeshLambertMaterial({color:'#3f3'});

		let all = loader.load('images/all.png');
		all.magFilter = THREE.NearestFilter;
		this.assets.boxMaterial = new THREE.MeshLambertMaterial({ map: all });

		this.createScene();
		this.addLights();
	}

	addSky()
	{
		let uniforms = {
			"topColor": { value: new THREE.Color( 0x0077ff ) },
			"bottomColor": { value: new THREE.Color( 0xe0e0ff ) },
			"offset": { value: 33 },
			"exponent": { value: 0.6 }
		};

		let skyGeo = new THREE.SphereBufferGeometry( 800, 32, 15 );
		//let skyMat = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.BackSide} );
		let skyMat = new THREE.ShaderMaterial( {
			uniforms: uniforms,
			vertexShader: this.assets.vertexShader['data'],
			fragmentShader: this.assets.fragmentShader['data'],
			side: THREE.BackSide
		} );

		let sky = new THREE.Mesh( skyGeo, skyMat );
		this.scene.add( sky );
	}

	createScene()
	{
		this.scene.background = new THREE.Color( 0x8cc4fe );
		//this.scene.fog = new THREE.FogExp2(this.scene.background, 0.03);
		this.addSky();

		this.camera.position.set(10, 4, 20);
		this.camera.lookAt(10, 4, 0);
		this.camera.rotation.order = "YXZ"; 
	}

	getBlock(x, y, z)
	{
		if (y < HEIGHT_MIN) return 2;

		let h1 = Utils.perlin.noise(x/30, z/30);
		let h2 = Utils.perlin.noise(x/10 + 100, z/10 + 100);


		if (x > 0 && x < 5) {
			let cave = Utils.perlin.noise(x/10 + 255, y/10 + 255, z/10 + 255);
			if (cave > 0.5) return 0;
		}

		let h = Math.floor((h1 + h2) * (HEIGHT_MAX - HEIGHT_MIN) / 2) + HEIGHT_MIN;
		//let h = Math.floor(Utils.perlin.noise(x/10, z/10) * (HEIGHT_MAX - HEIGHT_MIN)) + HEIGHT_MIN;

		if (y < h && y > 3 && y < 8) return 2;
		if (y <= h && y < 0) return 3;

		return (y > h)? 0 : 1;
	}

	getBlocks(x, y, z)
	{
		let b = {};
		b.id = this.getBlock(x, y, z);

		b.nx = this.getBlock(x-1, y, z);
		b.px = this.getBlock(x+1, y, z);
		b.ny = this.getBlock(x, y-1, z);
		b.py = this.getBlock(x, y+1, z);
		b.nz = this.getBlock(x, y, z-1);
		b.pz = this.getBlock(x, y, z+1);

		b.hidden = (b.nx && b.px && b.ny && b.py && b.nz && b.pz);

		return b;
	}

	addChunk(x, z)
	{
		let name = x+','+z;
		if (this.chunks[name]) return false;

		let chunk = new Chunk(this, x, z);

		let m = new THREE.Mesh(
			new THREE.BufferGeometry().fromGeometry(chunk.createGeometry()), 
			this.assets.boxMaterial
		);

		m.name = name;

		this.scene.add(m);

		this.chunks[name] = {x, z, name};
		return true;
	}

	updateChunks(pos)
	{
		let cx = Math.floor(pos.x / CHUNK_SIZE);
		let cz = Math.floor(pos.z / CHUNK_SIZE);

		if (this.cpos.x == cx && this.cpos.z == cz) return;

		for (let c of Object.values(this.chunks)) {
			if (Math.abs(c.x - cx) < 3 && Math.abs(c.z - cz) < 3) continue;
			
			//remove chunk
			let chunk = this.scene.getObjectByName(c.name);
			this.scene.remove(chunk);
			delete this.chunks[c.name];
			return;
		}

		for (let i = -2; i <= 2; i++) {
			for (let j = -2; j <= 2; j++) {
				if (this.addChunk(cx + i, cz + j)) return;
			}
		}

		this.cpos = this.chunks[cx +','+cz];
	}

	addLights()
	{
		let ambientLight = new THREE.AmbientLight( 0x999999 );
		this.scene.add( ambientLight );

		let directionalLight = new THREE.DirectionalLight( 0x999999, 2 );
		directionalLight.position.set( 1, 1, 0.5 ).normalize();
		this.scene.add( directionalLight );

		let sun = new THREE.PlaneGeometry(50, 50);
		sun.translate(0, 200, -400);
		sun.rotateY( - Math.PI / 2 );

		this.scene.add(
			 new THREE.Mesh(sun, new THREE.MeshBasicMaterial( {color: 0xffff00} ))
		);

	}

	update()
	{
		this.requestUpdate();

		if (!this.isPointerLock()) {
			this.renderer.render( this.scene, this.camera );
			return;
		}

		let pos = this.camera.position;

		this.camera.rotation.x = -(this.mouse.vy / window.innerHeight - 0.5) * Utils.TWO_PI;
		this.camera.rotation.y = -(this.mouse.vx / window.innerWidth - 0.5) * Utils.TWO_PI;

		this.camera.rotation.x = Utils.clamp(this.camera.rotation.x, -1.5, 1.5);

		if (this.kbmap['ArrowUp']) {
			pos.x -= Math.sin(this.camera.rotation.y) * .1;
			pos.z -= Math.cos(this.camera.rotation.y) * .1;	
		}

		if (this.kbmap['ArrowDown']) {
			pos.x += Math.sin(this.camera.rotation.y) * .1;
			pos.z += Math.cos(this.camera.rotation.y) * .1;
		}


		if (this.kbmap['ArrowLeft']) {
			pos.x -= Math.cos(this.camera.rotation.y) * .1;
			pos.z -= -Math.sin(this.camera.rotation.y) * .1;			
		}

		if (this.kbmap['ArrowRight']) {
			pos.x += Math.cos(this.camera.rotation.y) * .1;
			pos.z += -Math.sin(this.camera.rotation.y) * .1;			
		}

		if (this.mouse.hold == this.MB_LEFT) pos.y += .1;
		if (this.mouse.hold == this.MB_RIGHT) pos.y -= .1;

		if (this.mouse.buttons) {
			this.mouse.buttons = 0;
		}

		this.updateChunks(pos);

		this.renderer.render( this.scene, this.camera );
	}
}

class Chunk
{
	constructor(game, x, z)
	{
		this.game = game;
		this.matrix = new THREE.Matrix4();
		this.geometry = new THREE.Geometry();
		this.box = this.createBox();
		this.uvs = this.getUvs();
		this.x = x;
		this.z = z;
	}

	createBox()
	{
		let box = {};

		box.px = new THREE.PlaneGeometry(1, 1);
		box.px.rotateY( Math.PI / 2 );
		box.px.translate( 0.5, 0, 0 );

		box.nx = new THREE.PlaneGeometry(1, 1);
		box.nx.rotateY( - Math.PI / 2 );
		box.nx.translate( -0.5, 0, 0 );

		box.py = new THREE.PlaneGeometry(1, 1);
		box.py.rotateX( - Math.PI / 2 );
		box.py.translate( 0, 0.5, 0 );

		box.ny = new THREE.PlaneGeometry(1, 1);
		box.ny.rotateX( Math.PI / 2 );
		box.ny.translate( 0, -0.5, 0 );

		box.pz = new THREE.PlaneGeometry(1, 1);
		box.pz.translate( 0, 0, 0.5 );

		box.nz = new THREE.PlaneGeometry(1, 1);
		box.nz.rotateY( Math.PI );
		box.nz.translate( 0, 0, -0.5 );		

		return box;
	}

	getUvs()
	{
		return [
			[],
			[1,1,0,2,1,1],
			[2,2,2,2,2,2],
			[3,3,3,3,3,3]
		];
	}

	createGeometry()
	{
		let cx = this.x * CHUNK_SIZE;
		let cz = this.z * CHUNK_SIZE;

		for(let i = 0; i < CHUNK_SIZE; i++) {
			for(let j = 0; j < CHUNK_SIZE; j++) {
				for(let y = HEIGHT_MAX; y > HEIGHT_MIN - 2; y--) {
					let b = this.game.getBlocks(cx+j, y, cz+i);
					if (b.id == 0 || b.hidden) continue;
					this.addBox(b, cx+j, y, cz+i);
				}
			}
		}

		return this.geometry;
	}

	addPlane(p, tex)
	{
		let h = 0.125;

		// 0, face, vertex
		p.faceVertexUvs[ 0 ][ 0 ][ 1 ].y = 1 - (h + h * tex);
		p.faceVertexUvs[ 0 ][ 1 ][ 0 ].y = 1 - (h + h * tex);
		p.faceVertexUvs[ 0 ][ 1 ][ 1 ].y = 1 - (h + h * tex);

		p.faceVertexUvs[ 0 ][ 0 ][ 0 ].y = 1 - h * tex;
		p.faceVertexUvs[ 0 ][ 0 ][ 2 ].y = 1 - h * tex;
		p.faceVertexUvs[ 0 ][ 1 ][ 2 ].y = 1 - h * tex;

		this.geometry.merge(p, this.matrix);
	}

	addBox(b, x, y, z)
	{
		this.matrix.makeTranslation(x, y, z);

		let uv = this.uvs[b.id];

		if (b.nx == 0) this.addPlane(this.box.nx, uv[0]);
		if (b.px == 0) this.addPlane(this.box.px, uv[1]);
		if (b.py == 0) this.addPlane(this.box.py, uv[2]);
		if (b.ny == 0) this.addPlane(this.box.ny, uv[3]);
		if (b.pz == 0) this.addPlane(this.box.pz, uv[4]);
		if (b.nz == 0) this.addPlane(this.box.nz, uv[5]);
	}

}