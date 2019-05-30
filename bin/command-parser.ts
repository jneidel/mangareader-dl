import model from "./flag-command-model";

const shortCommands = {}; // structure: '{ d: "download" }'

const commands = model.commands;
Object.keys( commands )
  .forEach( command => {
    const short = commands[command].short

    if ( short ) {
      shortCommands[short] = command;
    }
  } )

export default function commandParser( commands ) {
  commands = commands.map( cmd => {
    return shortCommands[cmd] ? shortCommands[cmd] : cmd;
  } )

  return commands;
}
