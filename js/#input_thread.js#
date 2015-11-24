var physics, last;

var deadzone = 0.2;

function init( e ) {
		console.log( 'Getting ready' );
		//assign physics port
		physics = e.data.physics;
		//Prepare for new messages
		self.onmessage = render_message;
		last = Date.now();
}

function render_message( e ) {
		var now = Date.now();
		var dt = ( now - last ) / 100;
		switch( e.data.type ) {
		case 'stop':
				self.onmessage = function(){};
				break;
		default:
				var x = e.data.x, y = e.data.y;
				if( ( x > deadzone || x < -deadzone ) ||
						( y > deadzone || y < -deadzone ) ) {
						var ux = x * Math.sqrt(1 - y * y / 2) * dt; //unit x with dt
						var uy = y * Math.sqrt(1 - x * x / 2) * dt; //unit y with dt
						physics.postMessage( { x: -ux, y: uy } );
				}
				self.postMessage( true );
		}
		last = now;
}

self.onmessage = init;
