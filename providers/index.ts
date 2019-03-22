import { readdirSync } from "mz/fs";

const providers: any = {};
const extensions: any = {};

let files = readdirSync( __dirname ) // Get all files in this directory (providers)
  .map( name => name.split( "." )[0] ) // Remove .ts
  .filter( name => ![ "index", "utils", "missing" ].includes( name ) )

files.forEach( name => {
  providers[name] = require( `./${name}` ); // import providers dynamically
  extensions[name] = providers[name].extension;
} )

/*
 * List of extensions, used to check which providers are available
 */
export { extensions }

/*
 * Get the functions for the given provider
 */
export function getLib( provider ) {
  const providerNames = Object.keys( providers );

  if ( providerNames.includes( provider ) ) {
    return providers[provider]
  } else {
    return null;
  }
}

