const text2png = require( "text2png" );

/**
 * Create img buffer from http status and manga
 */
exports.createBufferFromStatus = ( status, manga ) => text2png( `Download Error (status ${status})
provider: ${manga.provider}
name: ${manga.name}
chapter: ${manga.chapter}
page: ${manga.page}`, { bgColor: "white", backgroundColor: "white", textAlign: "center", output: "buffer", lineSpacing: 20, padding: 50 } );
