var world, input, positions, quaternions, callback, dt;

function init( e ) {
		console.log( 'Starting up!' );
		if( e.data.cannon_url ) {
				// Load cannon
				importScripts( e.data.cannon_url );
				dt = e.data.dt;
				//Setup input port
				input = e.data.input;
				// Create data arrays. For passing between threads
				N = 82; //Number of objects with physics components
				positions = new Float32Array( N * 3 );
				quaternions = new Float32Array( N * 4 );
				
				// Init physics
				world = new CANNON.World();
				world.broadphase = new CANNON.NaiveBroadphase();
				world.gravity.set( 0, 0, -9 );
				world.solver.tolerance = 0.001;

				// Player object
				var sphere = new CANNON.Sphere( 0.5 );
				var playerBody = new CANNON.Body( { mass: 5 } );
				playerBody.addShape( sphere );
				playerBody.position.set( 0, 0, 2 );
				world.add( playerBody );
				
				// Ground plane
				var plane = new CANNON.Plane();
				var groundBody = new CANNON.Body( { mass: 0 } );
				groundBody.addShape( plane );
				world.add( groundBody );
				console.log( groundBody );

				// Create 8 cubes
				var shape = new CANNON.Box( new CANNON.Vec3( 0.5, 0.5, 0.5 ) );
				for( var i = 0; i !== 80; i++ ) {
						var body = new CANNON.Body( { mass: 1 } );
						body.addShape( shape );
						body.position.set( Math.random() * 20 - 10, Math.random() * 20 - 10, i);
						world.add( body );
				}
				//Prepare for new messages
				self.onmessage = render_message;
				input.onmessage = input_message;
		}
}

function render_message( e ) {
		switch ( e.data.type ) {
		case 'return':
				positions = e.data.positions;
				quaternions = e.data.quaternions;
				break;
		case 'stop':
				clearInterval( callback );
				break;
		case 'start':
				callback = setInterval( tick, dt * 1000 );
				break;
		default:
				console.log( 'message type not supported' );
		}
}

function input_message( e ) {
		//Take input and apply it to the player objects
		var body = world.bodies[0];
		var vel = new CANNON.Vec3( e.data.x + body.velocity.x,
															 e.data.y + body.velocity.y,
															 body.velocity.z );
		body.velocity.copy( vel );
}

function tick() {
		//console.log( world.bodies[0].velocity );
		// Step the world
		world.step( dt );

		// Copy over the data to the buffers
		for( var i = 0; i !== world.bodies.length; i++ ) {
				var b = world.bodies[i],
						p = b.position,
						q = b.quaternion;
				positions[3*i + 0] = p.x;
				positions[3*i + 1] = p.y;
				positions[3*i + 2] = p.z;
				quaternions[4*i + 0] = q.x;
				quaternions[4*i + 1] = q.y;
				quaternions[4*i + 2] = q.z;
				quaternions[4*i + 3] = q.w;
		}

		// Send the updated positions to the render thread
		self.postMessage( {
				positions: positions,
				quaternions: quaternions,
				time: Date.now()
		} );
}

self.onmessage = init;
