import model from "./flag-command-model";
import * as strpad from "strpad";

/*
 * All these functions work with the object defined in "flag-command-model"
 */

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

  const longestCommandLength: number = commandNames.reduce(
    ( acc, name ) => name.length > acc ? name.length : acc,
    0,
  );

  const hasShortCommands = !!commandNames.filter( name => commands[name].short )
    .length;

  const commandString = commandNames.map( name => {
    const strArray: string[] = [];

    if ( hasShortCommands )
      strArray.push( commands[name].short ? `${commands[name].short},` : "  " );

    strArray.push( strpad.right( name, longestCommandLength ) );
    strArray.push( commands[name].description );

    return strArray.join( " " );
  } );

  return commandString.join( "\n" );
}

export function formatFlags( flags: any ) {
  // Relative to the input of formatCommands:
  //   commands.flags

  const flagNames = Object.keys( flags );

  const longestFlagLength: number =
    flagNames.reduce(
      ( acc, name ) => name.length > acc ? name.length : acc,
      0,
    ) + 2; // +2 for prepending "--"

  const hasShortFlags = !!flagNames.filter( name => model.flags[name].short )
    .length;

  const flagString = flagNames.map( name => {
    const strArray: string[] = [];

    if ( hasShortFlags ) {
      strArray.push(
        model.flags[name].short ? `-${model.flags[name].short},` : "   ",
      );
    }

    strArray.push( strpad.right( `--${name}`, longestFlagLength ) );
    strArray.push( flags[name] );

    return strArray.join( " " );
  } );

  return flagString.join( "\n" );
}
