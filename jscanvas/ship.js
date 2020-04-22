class Main extends NextGame {

	init()
	{
		super.init();
		this.canvas.width(800);
		this.canvas.height(600);

		this.ship = new Ship(this, 300, 300, [10, 0, -10, 10, -10, -10]);

		this.spaceObjects = new Group(this);
		this.particles = new Group(this);

		this.spaceObjects.add(this.ship);

		this.space = {
			x0: -30,
			y0: -30,
			x1: 830,
			y1: 630
		}

		this.score = 0;
		
		this.spawnEnemy();
	}

	update()
	{
		this.requestUpdate();

		this.canvas.clear();
		
		if (this.kbmap['ArrowLeft']) {
			this.ship.vx -= 0.2;
		}

		if (this.kbmap['ArrowRight']) {
			this.ship.vx += 0.2;
		}

		if (this.kbmap['ArrowUp']) {
			this.ship.vy -= 0.2;
		}

		if (this.kbmap['ArrowDown']) {
			this.ship.vy += 0.2;
		}

		this.ship.angle = Math.atan2(this.mouse.y - this.ship.y, this.mouse.x - this.ship.x);

		this.spaceObjects.draw();
		this.particles.draw();

		this.spaceObjects.collides(this.particles);
		this.spaceObjects.collides(this.spaceObjects);

		if(this.mouse.buttons) {
			this.ship.fire();
			this.mouse.buttons = 0;
		}

		this.canvas.setFont("20px verdana");
		this.canvas.text(20, 30, 'lime', "Power: " + this.ship.healthPoints  + " score: " + this.score);
	}

	explodeRand(x, y, size, color)
	{
		for (let i = 0; i < size; i++)
		{
			let b = new Frag(x, y);
			b.setVelocity(10, Math.random() * Utils.TWO_PI);
			b.color = color;

			this.particles.add(b)			
		}
	}

	explode(x, y, size, color, speed, fragClass)
	{

		let explosion = new Group(this);

		for (let i = 0; i < size; i++)
		{
			let b = new fragClass(x, y);
			b.setVelocity(speed/2, Utils.TWO_PI / size * i);
			b.color = color;


			explosion.add(b);
		}

		setTimeout(() => explosion.each(m => m.color = 'blue'), 1000);
		
		this.particles.add(explosion);

	}


	spawnEnemy()
	{
		setTimeout( () => this.spawnEnemy(), 1000);

		//console.log(this.spaceObjects.count(), this.spaceObjects.deadCount);

		if (this.spaceObjects.count() > 10) return;

		
		const MODEL = [-50,-10,10,-10,10,-20,-10,-20,-10,-10,50,-10,0,10];
		//const MODEL = [10, 0, -10, 10, -10, -10];

		let mob = new Enemy(this, Utils.random(100, 700), this.space.y0 + 10, MODEL);

		mob.setVelocity(Utils.random(1, 4), Math.random() * Utils.TWO_PI);
		this.spaceObjects.add(mob);
		console.log('spawn enemy');

	}

}

class Vobj
{
	constructor(x, y)
	{
		this.x = x;
		this.y = y;

		this.vx = 0;
		this.vy = 0;
		this.ax = 0;
		this.ay = 0;
		
		this.color = 'white';
		this.size = 5;
		this.dead = false;
	}

	update(game)
	{
		if (this.dead) return;

		this.vx += this.ax;
		this.vy += this.ay;
		this.x += this.vx;
		this.y += this.vy;
	}

	draw(canvas) {}

	collides(vobj)
	{
		if (this == vobj) return false;
		return ((vobj.x - this.x) ** 2 + (vobj.y - this.y) ** 2 <= (vobj.size + this.size) **2);
	}

	hit(vobj)
	{
		this.dead = true;
	}

	outOfScreen(canvas)
	{
		if (this.x < 0 || this.x > canvas.width()) return 1;
		if (this.y < 0 || this.y > canvas.height()) return 2;
		return 0;
	}

	setVelocity(size, angle)
	{
		this.vx = size * Math.cos(angle);
		this.vy = size * Math.sin(angle);
	}

}

class Group
{
	constructor(game)
	{
		this.game = game;
		this.members = [];
		this.deadCount = 0;
	}

	draw()
	{
		this.deadCount = 0;
		for(let m of this.members) {
			if (m.dead) {
				this.deadCount++;
				continue;
			}
			m.update(this.game);
			m.draw(this.game.canvas);
		}

		if (this.deadCount > 100) {
			this.cleanUp();
		}
	}

	count()
	{
		return (this.members.length - this.deadCount);
	}

	collides(group)
	{
		for(let m of this.members) {
			for(let n of group.members) {
				if (m.dead || n.dead) continue;
				if (m.collides(n)) {
					m.hit(n);
					n.hit(m);
				}
			}
		}
	}

	cleanUp()
	{
		console.log('cleanUp', this.members.length);
		this.members = this.members.filter(p => !p.dead);
		this.deadCount = 0;
	}

	add(m)
	{
		if (m instanceof Group) {
			this.members = this.members.concat(m.members);
		}
		else {
			this.members.push(m);
		}
	}

	each(f)
	{
		for(let m of this.members) {
			if (m.dead) continue;
			f(m);
		}
	}
}

class Frag extends Vobj
{
	constructor(x, y)
	{
		super(x, y);
		this.damage = 5;
		this.size = 2;
	}

	update(game)
	{
		super.update(game);
		if (this.outOfScreen(game.canvas)) this.dead = true;
	}

	draw(canvas)
	{
		canvas.circle(this.x, this.y, this.size, this.color);
	}
}

class Sprite extends Vobj
{

	constructor(game, x, y, nodes)
	{
		super(x, y);
		this.game = game;
		this.nodes = nodes;
		this.angle = 0;
		this.healthPoints = 10;
		this.damage = 0;
	}

	hit(vobj)
	{
		this.color = 'red';
		setTimeout( () => this.color = 'white', 200);

		this.healthPoints -= vobj.damage;

		if (this.healthPoints <= 0) this.destroy(vobj);

		if (vobj instanceof Frag) {
			this.vx += vobj.vx;
			this.vy += vobj.vy;
		}
	}

	destroy(src)
	{
		this.dead = true;
	}

	transformNodes()
	{
		let output = [];

		let a = this.angle;

		for(let i = 0; i < this.nodes.length; i += 2) {
			let x = this.nodes[i];
			let y = this.nodes[i+1];

			output.push(x * Math.cos(a) - y * Math.sin(a) + this.x);
			output.push(x * Math.sin(a) + y * Math.cos(a) + this.y);
		}

		return output;
	}

	draw(canvas)
	{
		this.x = Utils.clamp(this.x, 0, canvas.width());
		this.y = Utils.clamp(this.y, 0, canvas.height());

		let nodes = this.transformNodes();

		canvas.polygon(nodes, this.color);
	}
}

class Ship extends Sprite
{
	constructor(game, x, y, nodes)
	{
		super(game, x, y, nodes);

		this.decel = 0.05;
		this.angle = 1;
		this.size = 15;
		this.healthPoints = 50;
	}

	fire()
	{
		if (this.dead) {
			alert('You are dead!');
		}

		let p = new Frag(this.x, this.y);
		p.setVelocity(5, this.angle);

		p.x += 4 * p.vx;
		p.y += 4 * p.vy;
		p.color = 'red';

		this.game.particles.add(p);
	}

	destroy(src)
	{
		super.destroy(src);
		this.game.explodeRand(this.x, this.y, 20, 'purple');
	}			

	update(game)
	{
		this.vx += -Math.sign(this.vx) * this.decel;
		this.vy += -Math.sign(this.vy) * this.decel;

		let off = this.outOfScreen(game.canvas);

		if (off == 1) this.vx *= -1;
		if (off == 2) this.vy *= -1;

		this.vx = Utils.clamp(this.vx, -5, 5);
		this.vy = Utils.clamp(this.vy, -5, 5);

		this.x += this.vx;
		this.y += this.vy;
	}
}

class Enemy extends Sprite
{

	constructor(game, x, y, nodes)
	{
		super(game, x, y, nodes);
		this.size = 20;
	}

	update(game)
	{
		if (this.x < game.space.x0 || this.x > game.space.x1) this.vx *= -1;
		if (this.y < game.space.y0 || this.y > game.space.y1) this.vy *= -1;

		this.x += this.vx;
		this.y += this.vy;
	}

	hit(vobj)
	{
		super.hit(vobj);

		if (vobj instanceof Sprite) {
			if (Math.abs(this.vx) > Math.abs(this.vy)) {
				this.vx = Math.sign(this.x - vobj.x) * Math.abs(this.vx);
			}
			else {
				this.vy = Math.sign(this.y - vobj.y) * Math.abs(this.vy);
			}
		}
	}

	destroy(src)
	{
		super.destroy(src);
		this.game.explode(this.x, this.y, 10, 'lime', 5, Frag);
		this.game.score += 5;

		//Big bang!
		if (Math.random() < 0.1) {
			setTimeout(() => this.game.explode(this.x, this.y, 12, 'lime', 7, Frag), 200);
			setTimeout(() => this.game.explode(this.x, this.y, 15, 'yellow', 10, Frag), 400);
		}
	}		

	// draw(canvas)
	// {
	// 	canvas.rect(this.x - 20, this.y -20, 40, 40, this.color);
	// }

}

