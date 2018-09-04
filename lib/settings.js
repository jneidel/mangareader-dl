const fs = require( "mz/fs" );
const path = require( "path" );
const DotJson = require( "dot-json" );
const fileExists = require( "file-exists" );
const expandHomeDir = require( "expand-home-dir" );
const chalk = require( "chalk" );
const strpad = require( "strpad" );
const log = require( "./log" );
const termWidth = require( "term-size" );
const strLen = require( "string-length" );
const inquirer = require( "inquirer" );

const i = require( "." );

/**
 * Includes functions related to reading/writing the settings file
 */

const defaultSettings = {
  config: {
    outputPath: "./",
    provider  : "mangareader",
    dir       : false,
  }, history: {},
};

/**
 * Create settings file if missing, get settings file path
 * global > local
 * @returns settingsPath
 */
async function getSettingsPath() {
  const settings = {
    global: {
      path: expandHomeDir( "~/.mangareader-dl.json" ),
      get exists() { return fileExists.sync( this.path ); },
    },
    local: {
      path: path.resolve( __dirname, "..", "mangareader-dl.json" ),
      get exists() { return fileExists.sync( this.path ); },
    },
  };

  // Create config file if missing
  if ( !settings.global.exists && !settings.local.exists ) {
    const response = await inquirer.prompt( [
      {
        type   : "confirm",
        name   : "createGlobalConfig",
        message: "Do you want to create the global config at ~/.mangareader-dl.json?",
        default: true,
      },
    ] );

    const createConfig = name => fs.writeFile( settings[name].path, JSON.stringify( defaultSettings, null, 2 ) );

    if ( response.createGlobalConfig )
      await createConfig( "global" );
    else
      await createConfig( "local" );
  }

  return settings.global.exists ?
    settings.global.path :
    settings.local.path;
}

/**
 * @returns settings
 */
const createSettingsObject = path => new DotJson( path );

const readHistory = settings => settings.get( "history" );
const readConfig = settings => settings.get( "config" );
const readId = settings => settings.get( "id" ) || "";

/**
 * @returns defaults
 */
const parseDefaults = settings => ( {
  out     : settings.get( "config.outputPath" ) || "./",
  provider: settings.get( "config.provider" ) || "mangareader",
  dir     : settings.get( "config.dir" ) || false,
} );

/**
 * Write given data to history
 */
function writeHistory( settings, { name, chapter, provider, subscribe, path: outputPath } ) {
  const id = readId( settings );
  const subscribeDefault = settings.get( `history.${name}.subscribe` );
  const providerDefault = settings.get( `history.${name}.provider` );

  settings
    .set( `history.${name}.chapter`, chapter )
    .set( `history.${name}.path`, outputPath )
    .set( `history.${name}.provider`, provider )
    .set( `history.${name}.subscribe`, subscribe )
    .save();
}

/**
 * Read data for name from history
 */
function readHistoryForName( settings, name ) {
  const chapter = settings.get( `history.${name}.chapter` );
  const outputPath = settings.get( `history.${name}.path` );
  const provider = settings.get( `history.${name}.provider` );

  return { chapter, provider, path: outputPath };
}

/**
 * Output contents of settings.history via 'list' command
 */
function outputHistory( settings, isLatest = false ) {
  const mangaObj = settings.get( "history" );
  const mangas = Object.keys( mangaObj ).sort( ( a, b ) => a > b ? 1 : -1 );
  const longestName = mangas.reduce( ( acc, cur ) => cur.length > acc ? cur.length : acc, 0 );

  function shortenLine( line ) {
    const maxWidth = termWidth().columns;
    return strLen( line ) > maxWidth ? `${line.slice( 0, line.length - strLen( line ) + maxWidth - 3 )}...` : line;
    // strLen gets the real lenght, not counting colorcode, unicode escapes, etc.
  }

  function printManga( manga, isLatest = true ) {
    log.print( shortenLine( `  ${mangaObj[manga].subscribe ? isLatest ? chalk.green( "✓" ) : chalk.red( "✓" ) : " "} ${strpad.right( manga, longestName )} ${strpad.left( isLatest ? chalk.green( mangaObj[manga].chapter ) : chalk.red( mangaObj[manga].chapter ), 13 )} [${strpad.right( mangaObj[manga].provider, "mangareader".length )} ${mangaObj[manga].path}]` ) );
  }

  if ( mangas.length > 0 ) {
    log.prompt( "Downloaded manga:" );
    mangas.forEach( async manga => {
      if ( mangaObj[manga].subscribe !== undefined && mangaObj[manga].chapter !== undefined && mangaObj[manga].path !== undefined && mangaObj[manga].provider !== undefined ) {
        if ( isLatest ) {
          const lastChapter = await i.getLastChapter( manga, mangaObj[manga].provider ).catch( err => console.log( err ) );

          printManga( manga, lastChapter === mangaObj[manga].chapter );
        } else
          printManga( manga );
      }
    } );
  } else {
    log.prompt( `No manga downloaded yet. Specify --help for usage info.` );
  }
}

/**
 * Output contents of settings.config via 'config' command
 */
function outputConfig( settings ) {
  const { out, provider, dir, extended } = parseDefaults( settings );

  return `  Current configuration:
    --out: ${out}
    --dir: ${dir}
    --provider: ${provider}`;
}

const writeReset = ( settingsPath, config, history ) => {
  config = JSON.stringify( config, null, 2 );
  history = JSON.stringify( history, null, 2 );

  fs.writeFile( settingsPath, `{ "config": ${config}, "history": ${history} }` );
};

/**
 * Reset given setting [config/history]
 */
function reset( setting, settings, settingsPath, force ) {
  const id = readId( settings );

  switch ( setting ) {
    case "config":
      const history = readHistory( settings );
      writeReset( settingsPath, defaultSettings.config, history );
      break;
    case "history":
      const config = readConfig( settings );

      if ( force ) {
        writeReset( settingsPath, config, defaultSettings.history );
      } else {
        const history = readHistory( settings );
        const mangaList = Object.keys( history );

        const subscribedTo = {};
        mangaList.forEach( manga => {
          if ( history[manga].subscribe )
            subscribedTo[manga] = history[manga];
        } );

        writeReset( settingsPath, config, subscribedTo );
      }
      break;
  }
}

/**
 * Get all name, provider, chapter for manga with --subscribe
 */
function generateMangaList( settings ) {
  const history = readHistory( settings );

  const res = [];

  Object.keys( history ).forEach( manga => {
    const mangaObj = history[manga];

    if ( mangaObj.subscribe )
      res.push( {
        name    : manga,
        provider: mangaObj.provider,
        chapter : mangaObj.chapter,
      } );
  } );

  return res;
}

module.exports = {
  getSettingsPath,
  createSettingsObject,
  writeHistory,
  readHistory,
  readHistoryForName,
  outputHistory,
  outputConfig,
  parseDefaults,
  reset,
  readId,
  generateMangaList,
};
