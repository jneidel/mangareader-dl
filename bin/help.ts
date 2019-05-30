import model from "./flag-command-model";
import * as strpad from "strpad";

/*
 * All these functions work with the object defined in "flag-command-model"
 */

const indention = 2; // Spaces at the start of the line
const exlainationSpace = 2; // Spaces between the command/flag and the explaination

let activeCommandString = "";

export function getActiveCommand( commands ) {
  const active = commands.reduce( ( activeCommand, current ) => {
    return activeCommand[current] ? activeCommand[current] : activeCommand;
  }, model.commands );

  return active;
}

export function formatCommand( commands: any ) {
  // 'commands' is a portion of the commands model

  const commandNames = Object.keys( commands ).filter( name => {
    switch ( name ) {
      case "description":
      case "short":
      case "flags":
        return false;
        break;
      default:
        return true;
    }
  } );

  const longestCommandLength: number =
    commandNames.reduce(
      ( acc, name ) => name.length > acc ? name.length : acc,
      0,
    ) + exlainationSpace;

  const hasShortCommands = !!commandNames.filter( name => commands[name].short )
    .length;

  const commandString = commandNames.map( name => {
    const strArray: string[] = [];

    if ( hasShortCommands ) {
      strArray.push(
        commands[name].short ? `  ${commands[name].short},` : "     ",
      );
    } else {
      strArray.push( " ".repeat( indention - 1 ) ); // -1 to account for the space added at join
    }

    strArray.push( strpad.right( name, longestCommandLength ) );

    strArray.push( commands[name].description );

    return strArray.join( " " );
  } );

  return commandString.join( "\n" );
}

export function formatFlags( flags: any ) {
  // Relative to the input of formatCommands:
  //   commands.flags

  // Include --help and --version for every command
  flags.help = model.commands.flags.help;
  flags.version = model.commands.flags.version;

  const clean = name => name.split( " " )[0]; // name can be 'out <path>' which throws when used on model.flags

  const flagNames = Object.keys( flags );

  const longestFlagLength: number =
    flagNames.reduce(
      ( acc, name ) => name.length > acc ? name.length : acc,
      0,
    ) +
    2 +
    exlainationSpace; // +2 for prepending "--"

  const hasShortFlags = !!flagNames.filter(
    name => model.flags[clean( name )].short,
  ).length;

  const flagString = flagNames.map( name => {
    const strArray: string[] = [];
    const cleanedName = clean( name );

    if ( hasShortFlags ) {
      strArray.push(
        model.flags[cleanedName].short ?
          `${" ".repeat( indention )}-${model.flags[cleanedName].short},` :
          `   ${" ".repeat( indention )}`,
      );
    } else {
      strArray.push( " ".repeat( indention ) );
    }

    strArray.push( strpad.right( `--${name}`, longestFlagLength ) );
    strArray.push( flags[name] );

    return strArray.join( " " );
  } );

  return flagString.join( "\n" );
}
