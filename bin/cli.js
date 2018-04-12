#!/usr/bin/env node

const fs = require( "mz/fs" );
const path = require( "path" );
const yargs = require( "yargs" );
const DotJson = require( "dot-json" );
const mkdir = require( "make-dir" );
const fileExists = require( "file-exists" );

const { downloadManga } = require( "../lib/download" );
const i = require( "../lib" );

const supportedProviders = [ "mangareader", "readmng" ];

const configPath = path.resolve( __dirname, "..", "mangareader-dl.config.json" );
if ( !fileExists.sync( configPath ) ) fs.writeFileSync( configPath, "{}" );
const config = new DotJson( configPath );

const defaultOutputPath = config.get( "outputPath" ) || "./";
const defaultDirectory = config.get( "directory" ) || false;
const defaultProvider = config.get( "provider" ) || "mangareader";

const argv = yargs
  .usage( "Usage: $0 <manga> [options]" )
  .command( {
    command: "<manga>",
    desc   : `Manga to be downloaded, Format:
    https://www.mangareader.net/shingeki-no-kyojin
    shingeki-no-kyojin
    shingeki-no-kyojin/<chapter>`,
  } )
  .command( "list", "List downloaded manga" )
  .command( {
    command: "config",
    desc   : `Use flags to set their global defaults`,
  } )
  .demandCommand( 1, "You need to specifiy at least one command" )
  .option( "out", {
    alias      : "o",
    describe   : "Output directory for downloaded manga",
    default    : defaultOutputPath,
    requiresArg: true,
  } )
  .normalize( "out" ) // path.normalize()
  .option( "dir", {
    alias   : "d",
    describe: "Download into the directory '<output>/<manga>'",
    default : defaultDirectory,
    boolean : true,
  } )
  .option( "force", {
    alias   : "f",
    describe: "Use given chapter/path instead of reading from history, overwrite history",
    default : false,
    boolean : true,
  } )
  .option( "extended", {
    alias   : "e",
    describe: "Show an extended output",
    default : false,
    boolean : true,
  } )
  .option( "provider", {
    alias      : "p",
    describe   : "Specify site to download from\nOptions: [mangareader, readmng]",
    default    : defaultProvider,
    requiresArg: true,
  } )
  .help( "help" ) // Move help to bottom of options
  .alias( "help", "h" )
  .describe( "help", "Display help this message" )
  .version()
  .alias( "version", "v" )
  .example( "$ $0 shingeki-no-kyojin --out ~/aot", "Download all available chapter of Attack on Titan into ~/aot" )
  .example( "$ $0 https://www.mangareader.net/shingeki-no-kyojin/100", "Download all available chapter of Attack on Titan, starting at chapter 100 into the current directory (./)" )
  .example( "$ $0 shingeki-no-kyojin -do ~/manga", "Download Attack on Titan into the directory ~/manga/shingeki-no-kyojin" )
  .epilog( "For more information visit: https://github.com/jneidel/mangareader-dl" )
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
    i.outputHistory();
  }
} else if ( argv._[0] === "config" ) {
  if ( argv._[1] === "reset" ) {
    fs.writeFile( path.resolve( __dirname, "..", "mangareader-dl.config.json" ), "{}" );
    i.prependArrowPrintStdout( "Config has been reset." );
  } else {
    let outMsg = "";

    if ( outputPath !== defaultOutputPath ) {
      config.set( "outputPath", outputPath ).save();
      outMsg += `Default output path changed to '${outputPath}'. `;
    }

    if ( argv.dir ) {
      config.set( "dir", true ).save();
      outMsg += "'Directory' option globally enabled. ";
    } else {
      config.set( "dir", false ).save();
      outMsg += "'Directory' option globally disabled. ";
    }

    if ( argv.provider !== defaultProvider ) {
      config.set( "provider", argv.provider ).save();
      outMsg += `'${argv.provider}' has been set as your default provider.`;
    }

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

  downloadManga( url, options );
}

process.on( "unhandledRejection", ( err ) => { throw err; } );
