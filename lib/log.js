const logUpdate = require( "log-update" );
const chalk = require( "chalk" );
const errHndlr = require( "err-hndlr" );

exports.prompt = function prompt( msg, check = true ) {
  if ( check )
    logUpdate( `${chalk.green( `❯` )} ${msg}` );
};

function promptConsole( msg, check = true ) {
  if ( check )
    console.log( `${chalk.green( `❯` )} ${msg}` );
}

exports.promptConsole = promptConsole;

exports.update = function update( msg, check = true ) {
  if ( check )
    logUpdate( msg );
};

exports.print = function print( msg, check = true ) {
  if ( check )
    console.log( msg );
};

exports.printPrompt = promptConsole;

exports.error = errHndlr.throw;

