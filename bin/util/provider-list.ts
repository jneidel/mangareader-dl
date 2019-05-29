import { resolve } from "path";
import { readdir } from "fs";
import { promisify } from "util";
const readdirAsync = promisify( readdir );

export function getProviderList() {
  const providersPath = resolve( __dirname, "..", "providers" );
  return readdirAsync( providersPath ).then( list => {
    list = list.filter( name => /[jt]s/.test( name.split( "." )[1] ) ); // remove dirs
    list = list.filter( name => name[0] === name[0].toUpperCase() ); // first letter is capital
    list = list.map( name => name.split( "." )[0].toLowerCase() ); // remove .ts and lowercase
    return list;
  } );
}
