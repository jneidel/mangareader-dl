#!/usr/bin/env node

const fs = require( "mz/fs" );
const path = require( "path" );
const yargs = require( "yargs" );
const DotJson = require( "dot-json" );

const downloadManga = require( "../lib/download" );
const i = require( "../lib" );

const configPath = path.resolve( __dirname, "..", "mangareader-dl.config.json" );
const config = new DotJson( configPath );
const defaultOutputPath = config.get( "outputPath" ) || "./";

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
    desc   : `Use flags to set their global defaults
    -o .. Set global default output dir`,
  } )
  .demandCommand( 1, "You need to specifiy at least one command" )
  .option( "out", {
    alias      : "o",
    describe   : "Output directory for downloaded manga",
    default    : defaultOutputPath,
    requiresArg: true,
  } )
  .normalize( "out" ) // path.normalize()
  .option( "folder", {
    alias   : "f",
    describe: "Download into the folder '<output>/<manga>'",
    default : false,
    boolean : true,
  } )
  .help( "help" ) // Move help to bottom of options
  .alias( "help", "h" )
  .describe( "help", "Display help this message" )
  .version()
  .alias( "version", "v" )
  .example( "$ $0 shingeki-no-kyojin --out ~/aot", "Download all available chapter of Attack on Titan into ~/aot" )
  .example( "$ $0 https://www.mangareader.net/shingeki-no-kyojin/100", "Download all available chapter of Attack on Titan, starting at chapter 100 into the current directory (./)" )
  .example( "$ $0 shingeki-no-kyojin -fo ~/manga", "Download Attack on Titan into the directory ~/manga/shingeki-no-kyojin" )
  .epilog( "For more information visit: https://github.com/jneidel/mangareader-dl" )
  .showHelpOnFail( false, "Specify --help for available options" )
  .argv;

const outputPath = path.resolve( process.cwd(), argv.out );

if ( argv._[0] === "list" ) {
  i.outputHistory();
} else if ( argv._[0] === "config" ) {
  if ( outputPath !== defaultOutputPath ) {
    config.set( "outputPath", outputPath ).save();
  }

  if ( argv.folder ) {
    config.set( "folder", true ).save();
  } else {
    config.set( "folder", false ).save();
  }

  if ( outputPath !== defaultOutputPath && argv.folder ) {
    i.prependArrowPrintStdout( `Folder globally activated, default output path changed to '${outputPath}'` );
  } else if ( outputPath !== defaultOutputPath && !argv.folder ) {
    i.prependArrowPrintStdout( `Default output path changed to '${outputPath}'` );
  } else if ( argv.folder && outputPath === defaultOutputPath ) {
    i.prependArrowPrintStdout( "Folder globally activated." );
  } else if ( outputPath === defaultOutputPath ) {
    i.prependArrowPrintStdout( "Input matches default output path." );
  } else {
    i.prependArrowPrintStdout( `No options have been passed to 'config'. Specify --help for usage info.` );
  }
} else {
  downloadManga( argv._[0], argv.out );
}
