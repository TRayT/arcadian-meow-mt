const initializeThreads = ( data ) => {
	const a2d = new MessageChannel(),
	      d2r = new MessageChannel()

	let WebGL = new ArrayBuffer( 1 ) // temporary
	if( !data ) data = {}

	const agency = new Worker( data.agencyURL || 'agency.js' )
	// should warn that the default is being used
	agency.postMessage( { dynamics: a2d.port1 }, [ a2d.port1 ] )
	agency.onmessage = console.log

	const dynamics = new Worker( data.dynamicsURL || 'dynamics.js' )
	dynamics.postMessage( { agency: a2d.port2, render: d2r.port1 }, [ a2d.port2, d2r.port1 ] )
	dynamics.onmessage = console.log

	// needs a bunch of checks to see if a worker is available
	const render = new Worker( data.renderURL || 'render.js' )
	render.postMessage( { dynamics: d2r.port2, context: WebGL }, [ d2r.port2, WebGL ] )
	render.onmessage = console.log
	
	return { agency: agency, dynamics: dynamics, render: render }	
}

initializeThreads()

console.log( "Waiting for errors..." )
