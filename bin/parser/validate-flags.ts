import { basename } from "path";
import { model } from ".";
const { flags } = model;

function validateProvider( flagValues, providers ): void {
  const { provider } = flagValues;
  const providerExists = providers.includes( provider );
  if ( !providerExists ) {
    console.log( `error: Invalid provider: '${provider}'.
To see all available providers try --help.

For more information try --help.` );
    process.exit();
  }
}

function validatePaths( flagValues ) {
  Object.keys( flags )
    .filter( flag => flags[flag].require === "path" )
    .forEach( flag => {
      const path = flagValues[flag];
      const pathBase = basename( path );

      if ( pathBase === "undefined" || pathBase.startsWith( "--" ) ) {
        console.log( `error: Invalid --${flag} argument (path): '${pathBase}'.

For more information try --help.` );
        process.exit();
      } else if ( /https?:\//.test( path ) ) {
        console.log( `error: --${flag} received an url as an argument.

For more information try --help.` );
        process.exit();
      }
    } );
}

export function validateFlags( flagValues, commands, providers ) {
  validateProvider( flagValues, providers );
  validatePaths( flagValues );
  return flagValues;
}
