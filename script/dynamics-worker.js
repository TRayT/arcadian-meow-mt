import * as CANNON from 'cannon-es';

let agency, render, callback, fakeBuffer = {
	positions: [],
	rotations: []
};

const world = new CANNON.World({
	gravity: new CANNON.Vec3(0, 0, -10);
});

const agencyResponse = message => {
	handlers = {
		player: data => {
			let player = world.bodies[0];
			let velocity = new CANNON.Vec3(
				data.x + player.velocity.x,
				data.y + player.velocity.y,
				player.velocity.z
			);
			player.velocity.copy(velocity);
		}
	}

	handlers[message.data.type](message.data);
}

const tick = () => {
	// Sets the timestep to 1/30
	world.fixedStep(1/30);

	world.bodies.forEach((body, i) => {
		let p = body.position,
			r = body.quaternion;
		fakeBuffer.positions[3*i] = p.x;
		fakeBuffer.positions[3*i+1] = p.y;
		fakeBuffer.positions[3*i+2] = p.z;
		fakeBuffer.rotations[4*i] = r.x;
		fakeBuffer.rotations[4*i+1] = r.y;
		fakeBuffer.rotations[4*i+2] = r.z;
		fakeBuffer.rotations[4*i+3] = r.w;
	})

	render.postMessage({
		type: 'update',
		positions: fakeBuffer.positions,
		rotations: fakeBuffer.rotations
	});
}

const mainResponse = message => {
	handlers = {
		stop: () => {
			clearInterval(callback);
		},
		start: () => {
			callback = setInterval(tick, 1000/30);
		},
	}

	handlers[message.data.type](message.data);
}

const init = message => {
	console.log("Initializing the Dynamics systems");
	self.onmessage = monitorResponse;

	agency = message.data.agency;
	render = message.data.render;

	//Finish this with online reference
	// Doing a crappy job just to do it
	/*
	let player = new CANNON.Body({mass:75});
	player.addShape(new CANNON.Sphere(1/2));
	player.position.set(0,0,2);
	world.addBody(player);

	let ground = new CANNON.Body({mass:0});
	ground.addShape(new CANNON.Plane());
	world.addBody(ground);

	for(let i = 0; i !== 80; i++) {
		let body = new CANNON.Body({mass:20});
		body.addShape(new CANNON.Box(new CANNON.Vec3(1/2, 1/2, 1/2)));
		body.position.set(
			(i+2)*(i%2),
			(i+2)*((i+1)%2),
			2
		);

		world.addBody(body);
	}*/

	console.log("Bodies", world.bodies.map(body => body.position));
}

self.onmessage = init;
