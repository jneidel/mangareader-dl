import * as fs from "mz/fs" ;
import { resolve as pathResolve } from "path" ;
import DotJson from "dot-json" ;
import { sync as fileExists } from "file-exists" ;
import expandHomeDir from "expand-home-dir" ;
//@ts-ignore - chalk has no exported member green or red
import { green as chalkGreen, red as chalkRed } from "chalk" ;
import * as strpad from "strpad" ;
import * as log from "./log" ;
import termWidth from "term-size" ;
import strLen from "string-length" ;
import { prompt as inquirerPrompt } from "inquirer" ;

import * as i from "." ;

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
export async function getSettingsPath() {
  const settings = {
    global: {
      path: expandHomeDir( "~/.mangareader-dl.json" ),
      get exists() { return fileExists( this.path ); },
    },
    local: {
      path: pathResolve( __dirname, "..", "..", "mangareader-dl.json" ),
      get exists() { return fileExists( this.path ); },
    },
  };

  // Create config file if missing
  if ( !settings.global.exists && !settings.local.exists ) {
    const response = await inquirerPrompt( [
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
export function createSettingsObject( path ) {
  return new DotJson( path );
}

export const readHistory = settings => settings.get( "history" );
const readConfig = settings => settings.get( "config" );
export const readId = settings => settings.get( "id" ) || "";

/**
 * @returns defaults
 */
export function parseDefaults( settings ) {
  return {
    out     : settings.get( "config.outputPath" ) || "./",
    provider: settings.get( "config.provider" ) || "mangareader",
    dir     : settings.get( "config.dir" ) || false,
  }
}

/**
 * Write given data to history
 */
export function writeHistory( settings, { name, chapter, provider, subscribe, path: outputPath } ) {
  settings
    .set( `history.${name}.chapter`, chapter )
    .set( `history.${name}.path`, outputPath )
    .set( `history.${name}.provider`, provider )
    .set( `history.${name}.subscribe`, subscribe );
  // .save() - Manual fs.write to ensure corrent indentation

  fs.writeFileSync( settings._file, JSON.stringify( settings._object, null, 2 ) );
}

/**
 * Read data for name from history
 */
export function readHistoryForName( settings, name ) {
  const chapter = settings.get( `history.${name}.chapter` );
  const outputPath = settings.get( `history.${name}.path` );
  const provider = settings.get( `history.${name}.provider` );

  return { chapter, provider, path: outputPath };
}

const mangaList = {
  /**
   * Get manga list from history
   */
  get( settings, getMangaObj = false ) {
    this.mangaObj = settings.get( "history" );

    this.mangas = Object.keys( this.mangaObj ).sort( ( a, b ) => a > b ? 1 : -1 );
    this.mangas.forEachManga = this.forEach;

    if ( getMangaObj )
      return { mangas: this.mangas, mangaObj: this.mangaObj };
    else
      return this.mangas;
  },
  /**
   * Validate manga in this.mangas and apply func to each
   */
  async forEach( func, isAsync = false ) {
    const { mangaObj } = this;
    const { mangas } = this;

    for ( const manga of mangas ) {
      if ( // Validate manga
        mangaObj[manga].subscribe !== undefined &&
        mangaObj[manga].chapter !== undefined &&
        mangaObj[manga].path !== undefined &&
        mangaObj[manga].provider !== undefined
      ) {
        if ( isAsync )
          await func( manga );
        else
          func( manga );
      }
    }
  },
};

/**
 * Output contents of settings.history via 'list' command
 */
export function outputHistory( settings, isLatest = false ) {
  const getMangaObj = true;
  const { mangas, mangaObj } = mangaList.get( settings, getMangaObj );
  const longestName = mangas.reduce( ( acc, cur ) => cur.length > acc ? cur.length : acc, 0 );

  function shortenLine( line ) {
    const maxWidth = termWidth().columns;
    return strLen( line ) > maxWidth ? `${line.slice( 0, line.length - strLen( line ) + maxWidth - 3 )}...` : line;
    // StrLen gets the real lenght, not counting colorcode, unicode escapes, etc.
  }

  function printManga( manga, isLatest = true ) {
    log.print( shortenLine( `  ${mangaObj[manga].subscribe ? isLatest ? chalkGreen( "✓" ) : chalkRed( "✓" ) : " "} ${strpad.right( manga, longestName )} ${strpad.left( isLatest ? chalkGreen( mangaObj[manga].chapter ) : chalkRed( mangaObj[manga].chapter ), 13 )} [${strpad.right( mangaObj[manga].provider, "mangareader".length )} ${mangaObj[manga].path}]` ) );
  }

  async function checkLatestAndPrint( manga ) {
    if ( isLatest ) {
      const lastChapter = await i.getLastChapter( manga, mangaObj[manga].provider ).catch( err => log.error( "", { err } ) );

      printManga( manga, lastChapter === mangaObj[manga].chapter );
    } else {printManga( manga );}
  }

  if ( mangas.length === 0 ) {
    log.prompt( `No manga downloaded yet. Specify --help for usage info.` );
  } else {
    log.prompt( "Downloaded manga:" );
    mangas.forEachManga.call( mangaList, checkLatestAndPrint, true );
  }
}

/**
 * Output contents of settings.config via 'config' command
 */
export function outputConfig( settings ) {
  const { out, provider, dir } = parseDefaults( settings );

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
export function reset( setting, settings, settingsPath, force = false ) {
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
export function generateMangaList( settings ) {
  const history = readHistory( settings );

  const res: any[] = [];

  Object.keys( history ).forEach( manga => {
    const mangaObj = history[manga];

    if ( mangaObj.subscribe ) {
      res.push( {
        name    : manga,
        provider: mangaObj.provider,
        chapter : mangaObj.chapter,
      } );
    }
  } );

  return res;
}

/**
 *
 */
export async function checkForNewManga( settings ) {
  const getMangaObj = true;
  const { mangas, mangaObj } = mangaList.get( settings, getMangaObj );

  const newManga: any[] = [];

  async function addNewManga( mangaName ) {
    const manga = mangaObj[mangaName];

    if ( manga.subscribe ) {
      const lastChapter = await i.getLastChapter( mangaName, manga.provider )
        .catch( err => log.error( "", { err } ) );

      if ( lastChapter > manga.chapter )
        newManga.push( mangaName );
    }
  }

  let checking = true;
  const loadingSpinner = ( spinnerFrame = 0, dotsFrame = 0 ) => {
    const spinner = [ "⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏" ];
    const dots = [ ".", ".", ".", ".", "..", "..", "..", "..", "...", "...", "...", "..." ];

    setTimeout( () => {
      spinnerFrame = spinnerFrame < spinner.length - 1 ? spinnerFrame + 1 : 0;
      dotsFrame = dotsFrame < dots.length - 1 ? dotsFrame + 1 : 0;

      log.update( `${chalkGreen( spinner[spinnerFrame] )} Checking for new chapters${dots[dotsFrame]}`, checking );
      if ( checking )
        loadingSpinner( spinnerFrame, dotsFrame );
    }, 80 );
  };

  loadingSpinner();
  await mangas.forEachManga.call( mangaList, addNewManga, true );
  checking = false;

  if ( newManga.length === 0 ) {log.prompt( "There are no new chapters available." );} else {
    log.prompt( "New chapters are available for:" );
    newManga.forEach( manga => log.print( `  - ${manga}` ) );
    log.printPrompt( "Update using: $ mangareader-dl update" );
  }
}

