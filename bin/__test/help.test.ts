import model from "../flag-command-model";
import * as help from "../help";
const { commands } = model;

test( "currentCommand first in commands", () => {
  const argvCommands = [ "download" ];
  const answer = commands.download;

  const result = help.getActiveCommand( argvCommands );
  expect( result ).toEqual( answer );
} );
test( "currentCommand command is sub-command", () => {
  const argvCommands = [ "update", "check" ];
  const answer = commands.update.check;

  const result = help.getActiveCommand( argvCommands );
  expect( result ).toBe( answer );
} );

test( "formatCommand", () => {
  const inputCommands = commands;
  const answer = `d, download ${commands.download.description}
l, list     ${commands.list.description}
u, update   ${commands.update.description}`;

  const result = help.formatCommand( inputCommands );
  expect( result ).toBe( answer );
} );
test( "formatCommand with no subcommands", () => {
  const inputCommands = commands.list.reset;
  const answer = "";

  const result = help.formatCommand( inputCommands );
  expect( result ).toBe( answer );
} );

test( "formatFlags", () => {
  const inputCommands = commands.flags;
  const answer = `-h, --help    ${commands.flags.help}
-v, --version ${commands.flags.version}`;

  const result = help.formatFlags( inputCommands );
  expect( result ).toBe( answer );
} );
