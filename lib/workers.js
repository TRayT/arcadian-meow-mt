// I need to add generic events for all of them

const AgencyHandler = ( dynamics, url = "agency.js" ) => {
	const worker = new Worker( url )
	worker.postMessage( { dynamics: dynamics }, [ dynamics ] )

	const events = {
	// Events to log
		keydown: ( event ) => {

		},
		keyup: ( event ) => {

		},
	// Agency Specific events to send
		gamepadconnected: ( event ) => {
			console.log( "%s connected at index %d ",
			event.gamepad.id, event.gamepad.index )

			worker.postMessage( {
				type: "gamepadconnected",
				index: event.gamepad.index
			} )
		},
		gamepaddisconnected: ( event ) => {
			console.log( "%s disconnected at index %d ",
			event.gamepad.id, event.gamepad.index )

			worker.postMessage( {
				type: "gamepaddisconnected",
				index: event.gamepad.index
			} )
		}
	}
}

class DynamicsWorker extends Worker {
	constructor( url, agencyPort, renderPort ) {
		super( url )

		this.postMessage(
			{ agency: agencyPort, render: renderPort },
			[ agencyPort, renderPort ]
		)
	}
}

class RenderWorker { // Fake worker for now
	constructor( url, dynamicsPort ) {
		// Probably use a MessageChannel object to abstract
		// message passing
	}
}
