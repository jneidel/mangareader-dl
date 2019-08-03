import { readFile } from "fs";
import { resolve } from "path";
import { promisify } from "util";
const readFileAsync = promisify( readFile );

// Create buffer for missing (on the server) images
export function missingImage() {
  return readFileAsync( resolve( __dirname, "missing.png" ) );
}

