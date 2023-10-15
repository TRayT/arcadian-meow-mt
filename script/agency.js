const AgencyHandler = (toDynamics, toRender,
	uri = '/script/agency-worker.js') => {
	// our monitored input states
	const keyState = [], mouseButtons = [];
	let mouseCoords = [0,0], wheel = 0;
	// starting the worker
	const worker = new Worker(uri);
	// All of the DOM event handlers
	const eventHandlers = {
		//keyboard events
		keydown: event => {keyState[event.keyCode] = true;},
		keyup: event => {keyState[event.keyCode] = false;},
		// mouse events
		mousemove: event => {mouseCoords = [event.screenX, event.screenY]},
		mousedown: event => {mouseButtons[event.button] = true;},
		mouseup: event => {mouseButtons[event.button] = false;},
		wheel: event => {
			event.preventDefault();
			wheel += event.deltaY;
		},
		// gamepad events
		gamepadconnected: event => {
			worker.postMessage({
				type: "connect",
				index: event.gamepad.index,
			});
		},
		gamepaddisconnected: event => {
			worker.postMessage({
				type: "disconnect",
				index: event.gamepad.index,
			});
		}
		// ?touch events
	}
	// attaching them to the parent of all
	for (const eventType in eventHandlers) {
		document.addEventListener(eventType, eventHandlers[eventType], {passive: false});
	}
	// Turns a single gamepad poll into an array of numbers
	const processGamepad = gamepad => {
		if(gamepad && gamepad.connected) {
			return gamepads.buttons
				.map(button => button.value)
				.concat(gamepad.axes);
		}

		return [];
	}
	// Polls all the gamepads and turns them into an array of numbers
	const processGamepads = () => {
		return navigator.getGamepads()
			.reduce((all, gamepad) => {
				return all.concat(processGamepad(gamepad));
			}, []);
	}

	const prepareFakeBuffer = () => {
		//"Real" should pack the arrays of bools into bytes	
		//And accept a buffer it stores efficiently in
		return {
			type: "input",
			input: processGamepads().concat(keyState, mouseCoords, mouseButtons, [wheel])
		}
	}
	// The main threads responses to the agency worker
	const response = {
		get: data => {
			worker.postMessage(prepareFakeBuffer());
		}
	}
	// attaching our responses to the worker
	worker.onmessage = message => {
		response[message.data.type](message.data);	
	}
	// Sending our init message!
	worker.postMessage(
		{dyanmics: toDynamics, render: toRender},
		[toDynamics, toRender],
	);

	return worker;
}

export default AgencyHandler
