#!/usr/bin/env node

const fs = require( "mz/fs" );
const path = require( "path" );
const yargs = require( "yargs" );
const mkdir = require( "make-dir" );

const { downloadManga } = require( "../lib/download" );
const i = require( "../lib" );
const s = require( "../lib/settings" );

const supportedProviders = [ "mangareader", "readmng" ];

const settings = s.setupSettingsFile();
const defaults = s.parseDefaults( settings );

const argv = yargs
  .usage( "Usage: $0 <manga> [options]" )
  .command( "<manga>", `Manga to download, Format (url or name):
    https://www.mangareader.net/shingeki-no-kyojin
    shingeki-no-kyojin
    shingeki-no-kyojin/<chapter>` )
  .command( "list", "List downloaded manga" )
  .command( "config", `Set defaults by specifying their flags` )
  .demandCommand( 1, "You need to specifiy at least one command. Specify --help for all available commands." )
  .option( "out", {
    alias      : "o",
    describe   : "Set output path, eg: './manga'",
    default    : defaults.out,
    requiresArg: true,
  } )
  .normalize( "out" ) // path.normalize()
  .option( "dir", {
    alias   : "d",
    describe: "Download into the directory '<output-path>/<manga>'",
    default : defaults.dir,
    boolean : true,
  } )
  .option( "force", {
    alias   : "f",
    describe: "Use specified chapter/path instead of reading from history,\noverwrites history",
    default : false,
    boolean : true,
  } )
  .option( "extended", {
    alias   : "e",
    describe: "Download with extended progress bar",
    default : defaults.extended,
    boolean : true,
  } )
  .option( "provider", {
    alias      : "p",
    describe   : "Set site to download from\nOptions: [mangareader, readmng]",
    default    : defaults.provider,
    requiresArg: true,
  } )
  .help( "help" ) // Move help to bottom of options
  .alias( "help", "h" )
  .describe( "help", "Display this help message" )
  .version()
  .alias( "version", "v" )
  .example( "$ $0 https://www.mangareader.net/shingeki-no-kyojin/100", "Download chapters 100+ of AoT into './'" )
  .example( "$ $0 shingeki-no-kyojin -o ~/aot", "Download all chapters of Attack on Titan into '~/aot'" )
  .epilog( "For the full documentation, along with more examples visit: https://github.com/jneidel/mangareader-dl" )
  .showHelpOnFail( false, "Specify --help for available options" )
  .argv;

// Clean up input
let outputPath = path.isAbsolute( argv.out ) ? argv.out : path.resolve( process.cwd(), argv.out );

if ( !~supportedProviders.indexOf( argv.provider ) ) {
  i.prependArrowPrintStdout( `The provider '${argv.provider}' is not supported. Please choose one from the list:\n  [${supportedProviders}]\n  Or submit a issue on GitHub requesting support of the given provider.` );
  process.exit();
}

// Parse commands/options
if ( argv._[0] === "list" ) {
  if ( argv._[1] === "reset" ) {
    fs.writeFile( path.resolve( __dirname, "..", "mangareader-dl.history.json" ), "{}" );
    i.prependArrowPrintStdout( "History has been reset." );
  } else {
    s.outputHistory( settings );
  }
} else if ( argv._[0] === "config" ) {
  if ( argv._[1] === "reset" ) {
    fs.writeFile( path.resolve( __dirname, "..", "mangareader-dl.config.json" ), "{}" );
    i.prependArrowPrintStdout( "Config has been reset." );
  } else {
    let outMsg = "";

    if ( outputPath !== defaults.out ) {
      settings.set( "config.outputPath", outputPath ).save();
      outMsg += `Default output path set to '${outputPath}'. `;
    }

    if ( argv.provider !== defaults.provider ) {
      settings.set( "config.provider", argv.provider ).save();
      outMsg += `'${argv.provider}' set as default provider. `;
    }

    settings.set( "config.dir", argv.dir ).save();
    if ( argv.dir !== defaults.dir )
      outMsg += argv.dir ? "'--dir' option enabled. " : "'--dir' option disabled. ";

    settings.set( "config.extended", argv.extended ).save();
    if ( argv.extended !== defaults.extended )
      outMsg += argv.extended ? "'--extended' option enabled." : "'--extended' option disabled.";

    if ( outMsg.length === 0 ) {
      outMsg = `No options have been passed to 'config'. Specify --help for usage info`;
    }

    i.prependArrowPrintStdout( outMsg );
  }
} else {
  const url = argv._[0];

  if ( argv.dir ) {
    const { name } = i.parseFromUrl( url );
    const newOut = path.join( outputPath, name );

    mkdir.sync( newOut );
    outputPath = newOut;
  }

  const options = {
    outputPath,
    provider: argv.provider,
    isForce : argv.force,
    isExt   : argv.extended,
  };

  downloadManga( url, options, settings );
}

process.on( "unhandledRejection", ( err ) => { throw err; } );
