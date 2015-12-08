var physics, last, callback;

var deadzone = 0.1;

function View() {
		this.rot = 0;
		this.zoom = 0;
		this.get_vec3 = function( rot, zoom ) {
				this.rot += rot * Math.PI / 1;
				this.zoom += zoom;
				this.zoom = this.zoom > 1 ? 1 : this.zoom < -1 ? -1 : this.zoom;
				var zoom = this.zoom * 3 + 5;
				var x = Math.sin( this.rot ) * -zoom;
				var y = Math.cos( this.rot ) * zoom;
				var z = this.zoom * 2 + 3;
				return { type: 'camera', x: x, y: y, z: z };
		}
}

var view = new View();

function init( e ) {
		console.log( 'Getting ready' );
		//assign physics port
		physics = e.data.physics;
		//Prepare for new messages
		self.onmessage = render_message;
		callback = setInterval( request, 10 );
		last = Date.now();
}

function request() {
		self.postMessage( { type: 'get' } );
}

function render_message( e ) {
		var now = Date.now();
		var dt = ( now - last ) / 1000;
		switch( e.data.type ) {
		case 'stop':
				clearInterval( callback );
				break;
		case 'start':
				callback = setInterval( request, 10 );
				break;
		default:
				var x = e.data.lx, y = e.data.ly;
				if( ( x > deadzone || x < -deadzone ) ||
						( y > deadzone || y < -deadzone ) ) {
						var ux = x * Math.sqrt(1 - y * y / 2) * dt * -15; //unit x with dt
						var uy = y * Math.sqrt(1 - x * x / 2) * dt * 15; //unit y with dt

						var rx = ux * Math.cos( view.rot ) - uy * Math.sin( view.rot );
						var ry = ux * Math.sin( view.rot ) + uy * Math.cos( view.rot );
						physics.postMessage( { x: rx, y: ry } );
				}
				x = e.data.rx, y = e.data.ry;
				if( ( x > deadzone || x < -deadzone ) ||
						( y > deadzone || y < -deadzone ) ) {
						self.postMessage( view.get_vec3( x * dt, y * dt ) );
				}
		}
		last = now;
}

self.onmessage = init;
