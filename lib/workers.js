class AgencyWorker extends Worker {
	constructor( url, dynamicsPort ) {
	
		super( url )

		this.postMessage( 
			{ dynamics: dynamicsPort },
			[ dynamicsPort ]
		)

				

		this.onmessage = ( message ) => {
			// The core logic goes here		
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
