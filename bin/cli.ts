import * as util from "./util";
import { flagParser, commandParser } from "./parser";
import { version, help } from "./flags";

( async function main() {
  const providers = await util.getProviderList();

  let { flags, commands } = flagParser( process.argv );
  commands = commandParser( commands );

  if ( flags.version ) {
    const versionString = await version();
    console.log( versionString );
    process.exit();
  }

  if ( flags.help || commands.length === 0 ) {
    const helpString = help( commands, providers );
    console.log( helpString );
    process.exit();
  }
} )();

process.on( "unhandledRejection", err => {
  console.log( err );
} );
