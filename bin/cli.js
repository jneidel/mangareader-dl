import * as util from "./util";
import { flagParser, commandParser, validateFlags } from "./parser";
import { version, help } from "./flags";

( async function main() {
  const providers = await util.getProviderList();

  let { flags, commands } = flagParser( process.argv );
  commands = commandParser( commands );
  flags = validateFlags( flags, commands, providers )
  // Flag validator (filter out irrelevant flags for command,
  //  validatate passed flags to be valid for command)

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

  console.log( commands, flags )
  // Command validation (has required, correct usage, correct order=
  // Command runner (case exec commands, * as manga, dynamically create manga from provider based on given -p or url (or default))
} )();

process.on( "unhandledRejection", err => {
  console.log( err );
} );
