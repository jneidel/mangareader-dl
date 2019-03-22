import logUpdate from "log-update" ;
//@ts-ignore
import { green as chalkGreen } from "chalk" ;
import { throw as errHndlrThrow } from "err-hndlr" ;

export function prompt( msg, check = true ) {
  if ( check )
    logUpdate( `${chalkGreen( `❯` )} ${msg}` );
};

export function promptConsole( msg, check = true ) {
  if ( check )
    console.log( `${chalkGreen( `❯` )} ${msg}` );
}
export { promptConsole as printPrompt };

export function update( msg, check = true ) {
  if ( check )
    logUpdate( msg );
};

export function print( msg, check = true ) {
  if ( check )
    console.log( msg );
};

export { errHndlrThrow as error };

