const fs = require( "mz/fs" );
const path = require( "path" );
const DotJson = require( "dot-json" );
const fileExists = require( "file-exists" );
const expandHomeDir = require( "expand-home-dir" );
const chalk = require( "chalk" );
const strpad = require( "strpad" );

const i = require( "." );

/* Includes functions related to reading/writing the settings file */

/**
 * Create settings object, parse default config from settings file
 */
function setupSettingsFile() {
  const globalSettingsPath = expandHomeDir( "~/.mangareader-dl.json" );
  const localSettingsPath = path.resolve( __dirname, "..", "mangareader-dl.json" );

  const settingsPath = fileExists.sync( globalSettingsPath ) ? globalSettingsPath : localSettingsPath;
  if ( !fileExists.sync( settingsPath ) ) fs.writeFileSync( settingsPath, `{ "config": {}, "history": {} }` );

  const settings = new DotJson( settingsPath );

  return settings;
}

/**
 * Parse defaults from settings file
 */
const parseDefaults = settings => ( {
  out     : settings.get( "config.outputPath" ) || "./",
  provider: settings.get( "config.provider" ) || "mangareader",
  dir     : settings.get( "config.dir" ) || false,
  extended: settings.get( "config.extended" ) || false,
} );

/**
 * Write given data to history
 */
function writeHistory( settings, { name, chapter, provider, path: outputPath } ) {
  settings
    .set( `history.${name}.chapter`, chapter )
    .set( `history.${name}.path`, outputPath )
    .set( `history.${name}.provider`, provider )
    .save();
}

/**
 * Read data for name from history
 */
function readHistory( settings, name ) {
  const chapter = settings.get( `history.${name}.chapter` );
  const outputPath = settings.get( `history.${name}.path` );
  const provider = settings.get( `history.${name}.provider` );

  return { chapter, provider, path: outputPath };
}

/**
 * Output contents of ...history.json via 'list' command
 */
function outputHistory( settings ) {
  const mangaObj = settings.get( "history" );
  const mangas = Object.keys( mangaObj ).sort( ( a, b ) => a > b ? 1 : -1 );
  const longestName = mangas.reduce( ( acc, cur ) => cur.length > acc ? cur.length : acc, 0 );

  if ( mangas.length > 0 ) {
    i.prependArrowPrintStdout( "Downloaded manga:" );
    mangas.forEach( manga => console.log( `  ${strpad.right( manga, longestName )} ${strpad.left( chalk.green( mangaObj[manga].chapter ), 13 )} [${strpad.right( mangaObj[manga].provider, "mangareader".length )} ${mangaObj[manga].path}]` ) );
  } else {
    i.prependArrowPrintStdout( `No manga downloaded yet. Specify --help for usage info.` );
  }
}

module.exports = {
  setupSettingsFile,
  writeHistory,
  readHistory,
  outputHistory,
  parseDefaults,
};
