var physics, input, scene, renderer, last, camera, callback, mesh = [];
var kinematics = { positions: [], quaternions: [], time: 0 };

var phy_dt = 100;

function init(){
		//Create channel for workers to communicate with
		var channel = new MessageChannel();
		//Initialize input worker
		input = new Worker( 'js/input_thread.js' );
		input.postMessage( { physics: channel.port1 }, [ channel.port1 ] );
		//Initialize physics worker
		physics = new Worker( 'js/physics_thread.js' );
		physics.postMessage( { cannon_url: 'cannon.min.js', input: channel.port2, dt: phy_dt },
												 [ channel.port2 ] );
		physics.onmessage = function( e ) {
				//console.log( 'new data received @ ' + e.data.time );
				update_kinematics( e.data.time, e.data.positions, e.data.quaternions );
				//Return the buffers
				physics.postMessage( { type: 'return',
															 positions: e.data.positions,
															 quaternions: e.data.quaternions },
														 [ e.data.positions.buffer,
															 e.data.quaternions.buffer ] );
		}
		//Create scene
		scene = new THREE.Scene();
		//Configure Renderer
		renderer = new THREE.WebGLRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( renderer.domElement );
		//Assign resize function
		window.onresize = function(){
				resize( camera, renderer );
		}
		//Player geometry
		var geometry = new THREE.IcosahedronGeometry( 0.5, 1 );
		var material = new THREE.MeshBasicMaterial( { color: 0x009900 } );
		var sphere = new THREE.Mesh( geometry, material );
		scene.add( sphere );
		mesh.push( sphere );
		//Ground geometry
		var ground = new THREE.Mesh( new THREE.PlaneBufferGeometry( 250, 250 ),
																 new THREE.MeshBasicMaterial( { color: 0x999999 } ) );
		scene.add( ground );
		mesh.push( ground );
		// Create 8 cubes
		for( var i = 0; i !== 8; i++ ) {
				var cube = new THREE.Mesh( new THREE.BoxGeometry( 1, 1, 1 ),
																	 new THREE.MeshBasicMaterial( { color: 0x990000 } ) );
				scene.add( cube );
				mesh.push( cube );
		}
		//Camera setup
		camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
		camera.up.set( 0, 0, 1 );
		camera.position.set( 5, 5, 2 );
		camera.lookAt( sphere.position );
		//Start everything
		start();
}

function start() {
		last = Date.now();
		input.postMessage( { type: 'start' } );
		physics.postMessage( { type: 'start' } );
		render();
}

function stop() {
		input.postMessage( { type: 'stop' } );
		physics.postMessage( { type: 'stop' } );
		cancelAnimationFrame( callback );
}

function update_kinematics( time, position, rotation ) {
		//Set time one physics frame *ahead*
		kinematics.time = time + phy_dt;
		for( var i = 0; i !== mesh.length; i++ ) {
				kinematics.positions[i] = new THREE.Vector3( position[ 3 * i + 0 ],
																										 position[ 3 * i + 1 ],
																										 position[ 3 * i + 2 ] );
				kinematics.quaternions[i] = new THREE.Quaternion( rotation[ 4 * i + 0 ],
																													rotation[ 4 * i + 1 ],
																													rotation[ 4 * i + 2 ],
																													rotation[ 4 * i + 3 ] );
		}
}

function update_meshes( lerp ) {
		//update each mesh
		for( var i = 0; i !== mesh.length; i++ ) {
				if( !mesh[i].position.equals( kinematics.positions[i] ) ) {
						mesh[i].position.lerp( kinematics.positions[i], lerp );
				}
				if( !mesh[i].quaternion.equals( kinematics.quaternions[i] ) ) {
						mesh[i].quaternion.slerp( kinematics.quaternions[i], lerp );
				}
		}
}

function render() {
		var now = Date.now();
		var dt = now - last;

		if( kinematics.time !== 0 ) {
				var lerp = dt / ( kinematics.time - now );
				update_meshes( lerp );
				//console.log( kinematics.positions[0] );
		}

		//camera.lookAt( mesh[0].position );
		
    callback = requestAnimationFrame( render );
    renderer.render(scene, camera);
		last = now;
}

init();
