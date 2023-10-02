import AgencyHandler from '/agency.js'

let physics, render;
let render_stat, input_stat, physics_stat;
const phy_dt = 1/30;


document.addEventListener("keydown", event => {
	if(tracked_keys.includes(event.key)) keys[event.key] = true;
})

document.addEventListener("keyup", event => {
	if(tracked_keys.includes(event.key)) keys[event.key] = false;
})

const input_receiver = event => {
	switch (event.data.type) {
		case 'get':
			input_stat.end();
			let gamepad = navigator.getGamepads()[0];
			if( gamepad ){
				input.postMessage({ lx: gamepad.axes[0], ly: gamepad.axes[1],
				                    rx: gamepad.axes[2], ry: gamepad.axes[3],
				                    w: keys.w, a: keys.a, s: keys.s, d: keys.d });
			}
			input_stat.begin();
			break;
	}
}

const init = () => {
	// Create messages channels for the workers to communicate with
	let i2p = new MessageChannel();
	let p2r = new MessageChannel();
	let i2r = new MessageChannel();

	input = AgencyHandler(i2p.port1, i2r.port1);

	physics = new Worker('dynamics.js');
	physics.postMessage({
		input: i2p.port2,
		render: p2r.port1,
		dt: phy_dt
	}, [i2p.port2, p2r.port1] );

	//render = new Worker('render.js', {type: 'module'});
	render = new Worker('render.js');
	let offscreen = document.querySelector('canvas').transferControlToOffscreen();
	render.postMessage({
		input: i2r.port2,
		physiscs: p2r.port2,
		canvas: offscreen
	}, [i2r.port2, p2r.port2, offscreen]);

}

init();
