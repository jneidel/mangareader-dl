import { model } from ".";

const shortCommands = {}; // structure: '{ d: "download" }'

const { commands } = model;
Object.keys( commands )
  .forEach( command => {
    const { short } = commands[command];

    if ( short )
      shortCommands[short] = command;
  } );

export function commandParser( commands ) {
  commands = commands.filter( cmd => !/^\s*$/.test( cmd ) )
  commands = commands.map( cmd => {
    return shortCommands[cmd] ? shortCommands[cmd] : cmd;
  } );

  return commands;
}
