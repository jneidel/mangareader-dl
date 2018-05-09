const fs = require( "mz/fs" );
const path = require( "path" );
const mkdir = require( "make-dir" );

const i = require( "../lib" );
const s = require( "../lib/settings" );
const u = require( "../lib/update" );
const { downloadManga } = require( "../lib/download" );

/* Functions for parsing cli commands */

function list( settings, settingsPath ) {
  if ( settingsPath ) {
    s.reset( "history", settings, settingsPath );
    i.prependArrowPrintStdout( "History has been reset." );
  } else
    s.outputHistory( settings );

  checkForUpdate();
}

function config( args, settings, defaults, outputPath, settingsPath ) {
  if ( settingsPath ) { // If 'reset' has been passed
    s.reset( "config", settings, settingsPath );
    i.prependArrowPrintStdout( "Config has been reset." );
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

    settings.set( "config.extended", args.extended ).save();
    if ( args.extended !== defaults.extended )
      outMsg += args.extended ? "'--extended' option enabled." : "'--extended' option disabled.";

    if ( outMsg.length === 0 ) {
      outMsg = `No options have been passed to 'config'. Specify --help for usage info\n${s.outputConfig( settings )}`;
    }

    i.prependArrowPrintStdout( outMsg );
    checkForUpdate();
  }
}

function manga( args, outputPath, settings ) {
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

  downloadManga( url, options, settings );
}

async function update( args, settings ) {
  const id = s.readId( settings );
  const mangaList = u.generateMangaList( settings );

  const mangaToDownload = await u.getUpdates( id, mangaList );

  await mangaToDownload.forEach( async manga => {
    const options = {
      provider : manga.provider,
      bar      : args.bar,
      subscribe: true,
    };

    await downloadManga( manga.name, options, settings );
  } );
}

function checkForUpdate() {
  /* eslint-disable global-require */
  const updateCheck = require( "update-check" );
  const packageJson = require( "../package" );

  updateCheck( packageJson )
    .then( update => { if ( update ) i.prependArrowPrintStdout( `A new version of mangareader-dl is available: current ${packageJson.version}, latest ${update.latest}` ); } );
}

module.exports = {
  list,
  config,
  manga,
  update,
};
