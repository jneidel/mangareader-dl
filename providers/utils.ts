import * as fs from "mz/fs" ;
import * as path from "path" ;

/**
 * Create img buffer from http status and manga
 */
export function missingImage() {
  return fs.readFile( path.resolve( __dirname, "missing.png" ) );
}

