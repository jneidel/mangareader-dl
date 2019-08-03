import { model } from "../parser";
import * as strpad from "strpad";

/*
 * All these functions work with the object defined in "flag-command-model"
 */

const indention = 2; // Spaces at the start of the line
const exlainationSpace = 2; // Spaces between the command/flag and the explaination

let activeCommandString = "";

export function getActiveCommand( commands ) {
  const active = commands.reduce( ( activeCommand, current ) => {
    if ( activeCommand[current] ) {
      activeCommandString += `${current} `;
      return activeCommand[current];
    } else {
      return activeCommand;
    }
  }, model.commands );

  return active;
}

export function formatCommand( commands: any ) {
  // 'commands' is a portion of the commands model

  const commandNames = Object.keys( commands ).filter( name => {
    switch ( name ) {
      case "description":
      case "usage":
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

  // Include global flags for every command
  Object.keys( model.commands.flags ).forEach( flag => {
    flags[flag] = model.commands.flags[flag];
  } )

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

export function formatUsage( activeCommand ) {
  const usageString: any = [];

  activeCommand.usage.forEach( use => {
    usageString.push(
      `${" ".repeat( indention )}mangareader-dl ${activeCommandString}${use}`,
    );
  } );

  return usageString.join( "\n" );
}

export function help( commands, providers ) {
  const activeCommand = getActiveCommand( commands );
  const commandString = formatCommand( activeCommand );
  const flagString = formatFlags( activeCommand.flags );
  const usageString = formatUsage( activeCommand );

  const strArray: string[] = [];

  strArray.push( "mangareader-dl: CLI for comfortable manga download" );
  strArray.push( "  https://github.com/jneidel/mangareader-dl" );
  strArray.push( "" );

  if ( usageString !== "" ) {
    strArray.push( "USAGE" );
    strArray.push( usageString );
    strArray.push( "" );
  }

  if ( commandString !== "" ) {
    strArray.push( "SUBCOMMANDS" );
    strArray.push( commandString );
    strArray.push( "" );
  }

  if ( flagString !== "" ) {
    strArray.push( "FLAGS" );
    strArray.push( flagString );
    strArray.push( "" );
  }

  if ( activeCommandString === "download " ) {
    strArray.push( "PROVIDERS" );
    providers.forEach( name => strArray.push( `${" ".repeat( indention )}${name}` ) );
    strArray.push( "" );
  }

  strArray.splice( strArray.length - 1, 1 );
  return strArray.join( "\n" );
}
