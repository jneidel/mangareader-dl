const fs = require( "mz/fs" );
const path = require( "path" );
const mkdir = require( "make-dir" );
const range = require( "py-range" );

const i = require( "." );
const s = require( "./settings" );
const log = require( "./log" );
const downloadManga = require( "./download-manga" );

/* Functions for parsing cli commands */

function list( settings, resetObj, isLatest ) {
  if ( resetObj ) {
    s.reset( "history", settings, resetObj.settingsPath, resetObj.force );
    log.prompt( "History has been reset." );
  } else
    s.outputHistory( settings, isLatest );

  checkForUpdate();
}

function config( args, settings, defaults, outputPath, settingsPath ) {
  if ( settingsPath ) { // If 'reset' has been passed
    s.reset( "config", settings, settingsPath );
    log.prompt( "Config has been reset." );
  } else {
    let outMsg = "";

    if ( outputPath !== defaults.out ) {
      settings.set( "config.outputPath", outputPath ).save();
      outMsg += `Default output path set to '${outputPath}'. `;
    }

    if ( args.provider !== defaults.provider ) {
      settings.set( "config.provider", args.provider ).save();
      outMsg += `'${args.provider}' set as default provider. `;
    }

    settings.set( "config.dir", args.dir ).save();
    if ( args.dir !== defaults.dir )
      outMsg += args.dir ? "'--dir' option enabled. " : "'--dir' option disabled. ";

    if ( outMsg.length === 0 ) {
      outMsg = `No options have been passed to 'config'. Specify --help for usage info\n${s.outputConfig( settings )}`;
    }

    log.prompt( outMsg );
    checkForUpdate();
  }
}

async function manga( args, outputPath, settings ) {
  const url = args._[0];
  const { name } = i.parseFromUrl( url );

  if ( args.dir ) {
    const newOut = path.join( outputPath, name );

    mkdir.sync( newOut );
    outputPath = newOut;
  }

  const options = {
    outputPath,
    provider : args.provider,
    isForce  : args.force,
    bar      : args.bar,
    subscribe: args.subscribe,
  };

  await downloadManga( url, options, settings );
  process.exit(); // eslint-disable-line unicorn/no-process-exit
}

async function update( args, settings ) {
  if ( args.check ) {
    await s.checkForNewManga( settings );
  } else {
    if ( !args.silent )
      log.prompt( `Searching for updates...` );

    const defaults = s.parseDefaults( settings );
    const mangaList = s.generateMangaList( settings );
    const downloaded = [];

    for ( const manga of mangaList ) {
      const last = await i.getLastChapter( manga.name, manga.provider ? manga.provider : defaults.provider );

      if ( last > manga.chapter ) {
        const options = {
          bar       : args.silent ? null : args.bar,
          subscribe : true,
          provider  : manga.provider ? manga.provider : defaults.provider,
          outputPath: manga.path ? manga.path : path.join( path.normalize( defaults.out ), manga.name ),
        };
        await downloadManga( manga.name, options, settings );

        downloaded.push( { name: manga.name, start: manga.chapter, end: last } );
      }
    }

    const mangaStr = downloaded.reduce( ( arr, manga ) => {
      const name = manga.name;
      const start = manga.start;
      const end = manga.end;

      return `${arr}\n    - ${name} (${start + 3 > end ? range( start + 1, end + 1 ) : `${start}-${end}`})`;
    }, "" );

    if ( downloaded.length )
      setTimeout( () => {
        if ( args.silent )
          log.print( mangaStr.slice( 1, mangaStr.length ) );
        else
          log.prompt( `Updated the following manga:${mangaStr}` );
        process.exit(); // eslint-disable-line unicorn/no-process-exit
      }, 81 ); // Wait out the last recursive pb.update call
    else {
      if ( !args.silent )
        log.prompt( `No new updates are available` );
      process.exit(); // eslint-disable-line unicorn/no-process-exit
    }
  }
}

function checkForUpdate() {
  /* eslint-disable global-require */
  const updateCheck = require( "update-check" );
  const packageJson = require( "../package" );

  updateCheck( packageJson )
    .then( update => {
      if ( update )
        log.promptConsole( `A new version of mangareader-dl is available: current ${packageJson.version}, latest ${update.latest}` );
    } )
    .catch( err => {
      if ( err.code !== "ENOTFOUND" )
        log.error( err.message, { err } );
    } );
}

module.exports = {
  list,
  config,
  manga,
  update,
};

