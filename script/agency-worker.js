let dynamics, render, isGamepad = [false, false, false, false];
console.log("Agency worker ready for init");

mainResponse = {
	input: data => {
	//Gamepads, KeyStates, and Mouse X, Y, Buttons, and Wheel
		data.input; // in that order
		self.postMessage({type:'get'});
	},
	connect: data => {
		isGamepad[data.index] = true;
	},
	disconnect: data => {
		isGamepad[data.index] = false;
	},
	start: () => {},
	stop: () => {},
}

self.onmessage = message => {
	// Will require some communication to sync input timing
	dynamics = message.dynamics;
	//Consider requestAnimationFrame for sending Camera updates
	render = message.render;
		
	self.onmessage = message => {
		mainResponse[message.data.type](message.data);
	}
}
