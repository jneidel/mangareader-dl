export const list: any = [
  "mangareader",
  "mangalife",
  "mangainn",
  "readmng",
  "mangapanda",
];
export function isProvider( name: string ): boolean {
  return list.includes( name );
}

/* Import { readdirSync } from "mz/fs"; */
// let files = readdirSync( __dirname ) // Get all files in this directory (providers)
// .map( name => name.split( "." )[0] ) // Remove .ts
// .filter( name => ![ "index", "utils", "missing" ].includes( name ) )

// files.forEach( name => {
// providers[name] = require( `./${name}` ); // import providers dynamically
// extensions[name] = providers[name].extension;
// } )

/*
 * Get the functions for the given provider
 */
/* export function getLib( provider ) { */
// const providerNames = Object.keys( providers );

// if ( providerNames.includes( provider ) ) {
// return providers[provider]
// } else {
// return null;
// }
// }
