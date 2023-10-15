import AgencyHandler from '/script/agency.js';
import RenderHandler from '/script/render.js';

let dynamics, render, agency;
const phy_dt = 1/30;

const init = () => {
	// Create messages channels for the workers to communicate with
	let i2p = new MessageChannel();
	let p2r = new MessageChannel();
	let i2r = new MessageChannel();

	agency = AgencyHandler(i2p.port1, i2r.port1);

	//dynamics = new Worker('script/dynamics-worker.js', {type: 'module'});
	dynamics = new Worker('script/old-d.js', {type: 'module'});
	dynamics.postMessage({
		agency: i2p.port2,
		render: p2r.port1,
		dt: phy_dt
	}, [i2p.port2, p2r.port1]);

	render = RenderHandler(i2r.port2, p2r.port2);

	start();
}

const start = () => {
	agency.postMessage({type:'start'});
	dynamics.postMessage({type:'start'});
	render.postMessage({type:'start'});
}

const stop = () => {
	agency.postMessage({type:'stop'});
	dynamics.postMessage({type:'stop'});
	render.postMessage({type:'stop'});
}

init();
