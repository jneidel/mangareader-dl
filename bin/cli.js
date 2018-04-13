#!/usr/bin/env node

const fs = require( "mz/fs" );
const path = require( "path" );
const yargs = require( "yargs" );

const i = require( "../lib" );
const s = require( "../lib/settings" );
const cliCommands = require( "../lib/cli-commands" );

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
const outputPath = path.isAbsolute( argv.out ) ? argv.out : path.resolve( process.cwd(), argv.out );

if ( !~supportedProviders.indexOf( argv.provider ) ) {
  i.prependArrowPrintStdout( `The provider '${argv.provider}' is not supported. Please choose one from the list:\n  [${supportedProviders}]\n  Or submit a issue on GitHub requesting support of the given provider.` );
  process.exit();
}

const isReset = argv._[1] === "reset";

// Parse commands
switch ( argv._[0] ) {
  case "list":
    cliCommands.list( settings, isReset );
    break;
  case "config":
    cliCommands.config( argv, settings, defaults, outputPath, isReset );
    break;
  default: // <manga>
    cliCommands.manga( argv, outputPath, settings );
}

process.on( "unhandledRejection", ( err ) => { throw err; } );
