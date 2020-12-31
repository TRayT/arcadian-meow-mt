console.log( "agency starting..." )

const buffer = new Uint8Array( 32 ) // same size

self.onmessage = ( message ) => console.log( message.data )
