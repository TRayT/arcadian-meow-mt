var physics, input, scene, renderer, last, camera, callback, mesh = [];
var k, last_k;

//Delta time for physics simulation
var phy_dt = 1/30;

function Kinematic_frame( time, pos, rot ) {
		this.time = time + phy_dt;
		this.positions = [];
		this.quaternions = [];
		for( var i = 0; i !== mesh.length; i++ ) {
				this.positions.push( new THREE.Vector3( pos[ 3 * i + 0 ],
																								pos[ 3 * i + 1 ],
																								pos[ 3 * i + 2 ] ) );
				this.quaternions.push( new THREE.Quaternion( rot[ 4 * i + 0 ],
																										 rot[ 4 * i + 1 ],
																										 rot[ 4 * i + 2 ],
																										 rot[ 4 * i + 3 ] ) );
		}
}

function init(){
		//Create channel for workers to communicate with
		var channel = new MessageChannel();
		//Initialize input worker
		input = new Worker( 'js/input_thread.js' );
		input.postMessage( { physics: channel.port1 }, [ channel.port1 ] );
		input.onmessage = function( e ) {
				var gp = navigator.getGamepads()[0];
				if( gp ){
						input.postMessage( { x: gp.axes[0], y: gp.axes[1] } );
				}
		}
		//Initialize physics worker
		physics = new Worker( 'js/physics_thread.js' );
		physics.postMessage( { cannon_url: 'cannon.min.js', input: channel.port2, dt: phy_dt },
												 [ channel.port2 ] );
		physics.onmessage = function( e ) {
				if( k ){ last_k = k; }
				k = new Kinematic_frame( e.data.time, e.data.positions, e.data.quaternions );
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
		// Create 80 cubes
		for( var i = 0; i !== 80; i++ ) {
				var cube = new THREE.Mesh( new THREE.BoxGeometry( 1, 1, 1 ),
																	 new THREE.MeshBasicMaterial( { color: 0x990000 } ) );
				scene.add( cube );
				mesh.push( cube );
		}
		//Camera setup
		camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
		camera.up.set( 0, 0, 1 );
		camera.position.set( 0, 5, 3 );
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

function render() {
		var now = Date.now();
		var dt = now - last;

		//Update each mesh
		if( last_k ) {
				var lerp = ( now - last_k.time ) / ( k.time - last_k.time );
				for( var i = 0; i !== mesh.length; i++ ) {
						mesh[i].position.lerpVectors( last_k.positions[i], k.positions[i], lerp );
						THREE.Quaternion.slerp( last_k.quaternions[i], k.quaternions[i], mesh[i].quaternion, lerp );
				}
		}
		
		camera.position.set( mesh[0].position.x, mesh[0].position.y + 5, mesh[0].position.z + 3 );
		
    callback = requestAnimationFrame( render );
    renderer.render(scene, camera);
		last = now;
}

init();
