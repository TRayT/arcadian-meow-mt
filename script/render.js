const RenderHandler = (toAgency, toDynamics,
	uri = '/script/render-worker.js') => {
	const offscreen = document.querySelector('canvas').transferControlToOffscreen();
	//const worker = new Worker('render-worker.js', {type: 'module'});
	const worker = new Worker(uri, {type:'module'});

	worker.onmessage = console.log;
	worker.onerror = error => {
		console.error("The render worker crashed!");
	}

	const eventHandlers = {
		resize: event => {
			worker.postMessage({
				type: "resize",
				height: window.innerHeight,
				width: window.innerWidth
			});
		},
		blur: event => {

		},
		focus: event => {

		},
	}

	for (const eventType in eventHandlers) {
		window.addEventListener(eventType, eventHandlers[eventType]);
	}
	//Init message to the render worker
	worker.postMessage({
		agency: toAgency,
		dynamics: toDynamics,
		canvas: offscreen,
		//Non-transferable bits
		height: window.innerHeight,
		width: window.innerWidth,
	}, [toAgency, toDynamics, offscreen]);

	return worker;

}

export default RenderHandler;
