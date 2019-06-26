const fs = require( "mz/fs" );
const path = require( "path" );

/**
 * Create img buffer from http status and manga
 */
exports.missingImage = () => fs.readFile( path.resolve( __dirname, "missing.png" ) );

