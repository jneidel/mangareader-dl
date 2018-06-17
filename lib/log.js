const logUpdate = require( "log-update" );
const chalk = require( "chalk" );

exports.prompt = function prompt( msg, check = true ) {
  if ( check )
    logUpdate( `${chalk.green( `❯` )} ${msg}` );
};

exports.promptConsole = function promptConsole( msg, check = true ) {
  if ( check )
    console.log( `${chalk.green( `❯` )} ${msg}` );
};

exports.update = function update( msg, check = true ) {
  if ( check )
    logUpdate( msg );
};

exports.print = function print( msg, check = true ) {
  if ( check )
    console.log( msg );
};
