//Empty template

class Main extends NextGame {

	init()
	{
		super.init();
		this.canvas.width(800);
		this.canvas.height(600);
	}

	preload()
	{
	}

	update()
	{
		this.requestUpdate();
		this.canvas.clear();

		if (this.kb.key == 'SomeKey') {
			this.kb.key = '';
		};

		if (this.mouse.buttons) {
			this.mouse.buttons = 0;
		}
		
		this.time = this.now();
	}
}