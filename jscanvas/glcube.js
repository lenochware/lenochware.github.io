//Empty template

class Main extends NextGameGL {

	init()
	{
		super.init();

		this.objects = [];
		this.mesh = {}
		this.light = null;

		this.canvas2d = this.getCanvas2d();

		this.initMesh();
		this.createScene();
		this.addLights();
	}

	initMesh()
	{
		let box = new THREE.BoxGeometry(1,1,1);

		const textureLoader = new THREE.TextureLoader();
		let texture = textureLoader.load( 'images/wallset_csb_front2.png' );
		texture.anisotropy = 16;

		const mat1 = new THREE.MeshLambertMaterial( { map: texture, color: '#FFFFFF' } );

		const mat2 = new THREE.MeshBasicMaterial({
			map: new THREE.CanvasTexture(this.canvas2d),
		});

		// varying vec3 vUv = position; take zajimavy efekt 
		const vertexShader = `
    varying vec2 vUv; 

    void main() {
      vUv = uv; 
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

		const fragmentShader = `
		#include <common>

		uniform vec3 iResolution;
		uniform float iTime;
		varying vec2 vUv;

		#define S(a, b, t) smoothstep(a, b, t);

		vec3 Circle(vec2 uv, float t)
		{
		    float d = length(uv);
		    return (0.5 + 0.5*cos(t+uv.xyx+vec3(0,2,4))) * S(0.5, 0.3, d);
		}

		void mainImage( out vec4 fragColor, in vec2 fragCoord )
		{
		    // Normalized pixel coordinates (from 0 to 1)
		    vec2 uv = vUv.xy;//fragCoord/iResolution.xy;
		    
		    float t = iTime;
		    
		    uv -= 0.5;
		    uv.x *= iResolution.x/iResolution.y;
		    
		    //deformuj prostor
		    uv.y += uv.x * uv.x * sin(2.*t) * 2.;  
		    uv.x += uv.y * uv.y * sin(2.*t + 2.) * 2.;
		      
		    vec3 col = Circle(uv, t);

		    // Output to screen
		    fragColor = vec4(col,1.0);
		}

		void main() {
			mainImage(gl_FragColor, gl_FragCoord.xy);
		}		
		`;
		
		const uniforms = {
			iTime: { value: 0 },
			iResolution:  { value: new THREE.Vector3(300,300,1) },
		};

		const mat3 = new THREE.ShaderMaterial({
			fragmentShader,
			vertexShader,
			uniforms,
		});

		this.mesh = {
			cube1: new THREE.Mesh( box, mat1 ),
			cube2: new THREE.Mesh( box, mat2 ),
			cube3: new THREE.Mesh( box, mat3 ),
		}
	}

	createScene()
	{
		let m = this.mesh.cube1.clone();
		this.scene.add(m);
		this.objects.push(m);

		m = this.mesh.cube2.clone();
		m.position.x += 1.5;
		m.userData.updateTexture = true;
		this.scene.add(m);
		this.objects.push(m);

		m = this.mesh.cube3.clone();
		m.position.x -= 1.5;
		this.scene.add(m);
		this.objects.push(m);

	}

	addLights()
	{
		// create a point light
		this.light = new THREE.PointLight(0xFFFFFF, 1);

		// set its position
		this.light.position.x = 10;
		this.light.position.y = 50;
		this.light.position.z = 130;

		this.scene.add(this.light);		

		const am = new THREE.AmbientLight( 0x404040 ); // soft white light
		this.scene.add(am);
	}


	getCanvas2d()
	{
		const ctx = document.createElement('canvas').getContext('2d');
		ctx.canvas.width = 256;
		ctx.canvas.height = 256;
		ctx.fillStyle = '#F00';
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		return ctx.canvas;	
	}

	drawCanvas()
	{
		let ctx = this.canvas2d.getContext('2d');
		ctx.fillStyle = '#' + Utils.random(0, 0x1000000).toString(16).padStart(6, '0');
		ctx.beginPath();

		const x = Utils.random(0, 256);
		const y = Utils.random(0, 256);
		const radius = Utils.random(10, 64);
		ctx.arc(x, y, radius, 0, Math.PI * 2);
		ctx.fill();
	}

	updateShader()
	{
		let mat3 = this.mesh.cube3.material;
		//console.log(this.time/1000);
		mat3.uniforms.iTime.value += 0.01;
	}

	update()
	{
		this.requestUpdate();

		this.drawCanvas();
		this.updateShader();

		if (this.kbmap['ArrowUp']) {
			this.camera.position.z -= 0.1;
		}

		if (this.kbmap['ArrowDown']) {
			this.camera.position.z += 0.1;
		}

		this.scene.rotation.x = this.mouse.y / 200 - 0.8;
		this.scene.rotation.y = this.mouse.x / 200 - 3.5;

		if (this.mouse.buttons) {
			this.mouse.buttons = 0;
		}

		for (let o of this.objects) {
			if (o.userData.updateTexture) o.material.map.needsUpdate = true;

			// o.rotation.x += 0.01;
			// o.rotation.y += 0.01;
		}

		this.renderer.render( this.scene, this.camera );

		this.time = this.now();
	}
}