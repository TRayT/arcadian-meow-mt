var physics, input, scene, renderer, last, camera, camera_offset, callback, mesh = [];
var render_stat, input_stat, physics_stat
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

function update_camera() {
		camera.position.addVectors( mesh[0].position, camera_offset );
		camera.lookAt( mesh[0].position );
}

function input_message( e ) {
		switch ( e.data.type ) {
		case 'get':
				var gp = navigator.getGamepads()[ 0 ];
				if( gp ) {
						input.postMessage( { lx: gp.axes[ 0 ], ly: gp.axes[ 1 ],
																 rx: gp.axes[ 2 ], ry: gp.axes[ 3 ] } );
				}
				input_stat.end();
				input_stat.begin();
				break;
		case 'camera':
				camera_offset.set( e.data.x, e.data.y, e.data.z );
		}
}

function init(){
		//Setup stat components
		render_stat = new Stats();
		render_stat.domElement.id = "render_stat";
		input_stat = new Stats();
		input_stat.domElement.id = "input_stat";
		physics_stat = new Stats();
		physics_stat.domElement.id = "physics_stat";
		
		document.body.appendChild( render_stat.domElement );
		document.body.appendChild( input_stat.domElement );
		document.body.appendChild( physics_stat.domElement );
		//Create channel for workers to communicate with
		var channel = new MessageChannel();
		//Initialize input worker
		input = new Worker( 'js/input_thread.js' );
		input.postMessage( { physics: channel.port1 }, [ channel.port1 ] );
		input.onmessage = input_message;
		//Initialize physics worker
		physics = new Worker( 'js/physics_thread.js' );
		physics.postMessage( { cannon_url: 'cannon.min.js', input: channel.port2, dt: phy_dt },
												 [ channel.port2 ] );
		physics.onmessage = function( e ) {
				if( k ){ last_k = k; }
				k = new Kinematic_frame( e.data.time, e.data.positions, e.data.quaternions );
				physics_stat.end();
				physics_stat.begin();
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
		material = new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'asset/grid.png' ) } );
		var ground = new THREE.Mesh( new THREE.PlaneBufferGeometry( 100, 100 ), material );
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
		camera_offset = new THREE.Vector3( 0, 5, 3 );
		//Start everything
		start();
}

function start() {
		last = Date.now();
		input_stat.begin();
		physics_stat.begin();
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
		render_stat.begin();
		callback = requestAnimationFrame( render );
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
		
		update_camera();
    renderer.render(scene, camera);
		last = now;
		render_stat.end();
}

init();
