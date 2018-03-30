#!/usr/bin/env node

const fs = require( "mz/fs" );
const path = require( "path" );
const yargs = require( "yargs" );
const DotJson = require( "dot-json" );

const downloadManga = require( "../lib/download" );

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
  .help( "help" ) // Move msg to bottom
  .option( "help", {
    alias      : "h",
    description: "Display help message",
  } )
  .version()
  .alias( "version", "v" )
  .example( "$ mangareader-dl shingeki-no-kyojin --out ~/aot", "Download all available chapter of Attack on Titan into ~/aot" )
  .example( "$ mangareader-dl https://www.mangareader.net/shingeki-no-kyojin/100", "Download all available chapter of Attack on Titan, starting at chapter 100 into the current directory (./)" )
  .epilog( "For more information visit https://github.com/jneidel/mangareader-dl" )
  .showHelpOnFail( false, "Specify --help for available options" )
  .argv;

const outputPath = path.resolve( process.cwd(), argv.out );

if ( argv._[0] === "list" ) {
  console.log( "list passed" );
} else if ( argv._[0] === "config" ) {
  if ( outputPath !== defaultOutputPath ) {
    config.set( "outputPath", outputPath ).save();
    console.log( `Default output path changed to '${outputPath}'` );
  }
} else {
  downloadManga( argv._[0], argv.out );
}
