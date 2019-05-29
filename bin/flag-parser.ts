const flags = {
  out: {
    short  : "o",
    require: "string",
    default: ".", // defaults.out,
  },
  dir: {
    short  : "d",
    default: true, // defaults.dir,
  },
  "no-dir": {
    short  : "D",
    default: true, // defaults.dir,
  },
  force: {
    short: "f",
  },
  provider: {
    short  : "p",
    require: "string",
    default: "mangareader", // defaults.provider,
  },
  micro: {
    short: "m",
  },
  subscribe: {
    short: "s",
  },
  latest: {
    short: "l",
  },
  silent: {},
  debug : {},
};

const isLongFlag = item => item[0] === "-" && item[1] === "-";
const isShortFlag = item => item[0] === "-" && item[1] !== "-";

function splitShortFlags( argv ) {
  // '-do' to '-d -o'
  argv.forEach( item => {
    if ( isShortFlag( item ) && item.length > 2 ) {
      const index = argv.indexOf( item );
      argv.splice( index, 1 ); // Remove the '-do"

      item
        .split( "" )
        .reverse() // Otherwise the order will be inverted by splicing the same position
        .forEach( flag => {
          if ( flag !== "-" ) argv.splice( index, 0, `-${flag}` ); // Insert them separately
        } );
    }
  } );

  return argv;
}

function extendShortFlags( argv ) {
  // '-o' to '--out'
  const shortFlags = {};
  Object.keys( flags )
    .filter( flag => !!flags[flag].short )
    .forEach( flag => {
      const { short } = flags[flag];
      const long = flag;
      shortFlags[short] = long;
    } );

  const toRemove: number[] = [];
  argv = argv.map( item => {
    if ( isShortFlag( item ) ) {
      const longFlag = shortFlags[item[1]];

      if ( longFlag ) item = `--${longFlag}`;
      // Map short flag to long one
      else toRemove.push( argv.indexOf( item ) ); // I remove while looping through it will mess with the other flags
    }

    return item;
  } );

  if ( toRemove.length ) toRemove.forEach( index => argv.splice( index, 1 ) );

  return argv;
}

function turnFlagsIntoValues( argv ) {
  const flagValues = {};

  Object.keys( flags ).forEach( flag => {
    const defaultVal = flags[flag].default;
    flagValues[flag] = defaultVal ? defaultVal : false;
  } );

  const toRemove: number[] = [];
  argv.forEach( item => {
    if ( isLongFlag( item ) ) {
      const flag = item.replace( /^--/, "" );
      const index = argv.indexOf( item );
      const requiresArg = flags[flag].require;

      if ( requiresArg ) {
        const requiredIndex = index + 1;

        const requiredVal = argv[requiredIndex];
        flagValues[flag] = requiredVal;

        toRemove.push( requiredIndex );
      } else {
        flagValues[flag] = true;
      }

      toRemove.push( index );
    }
  } );

  toRemove.sort( ( a, b ) => b - a ); // requiresArg has a the argument index before the flag index ( 4, 3 )
  if ( toRemove.length ) toRemove.forEach( index => argv.splice( index, 1 ) );

  return { flagValues, commands: argv };
}

export default function parser( argv ) {
  argv.shift(); // Remove node
  argv.shift(); // Remove cli.js

  argv = splitShortFlags( argv );
  argv = extendShortFlags( argv );
  const { commands, flagValues } = turnFlagsIntoValues( argv );

  return { commands, flags: flagValues };
}
