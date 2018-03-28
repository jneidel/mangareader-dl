#!/usr/bin/env node

const fs = require( "mz/fs" );
const yargs = require( "yargs" );

const downloadManga = require( "../lib/cli" );
const i = require( "../lib" );

const argv = yargs
  .usage( "Usage: $0 <manga> [options]" )
  .command( {
    command: "<manga>",
    desc   : `Manga to be downloaded, Format:
    shingeki-no-kyojin
    https://www.mangareader.net/shingeki-no-kyojin
    https://www.mangareader.net/shingeki-no-kyojin/<chapter>`,
  } )
  .command( "list", "List downloaded manga" )
  .demandCommand( 1, "You need to specifiy at least one command" )
  .option( "out", {
    alias      : "o",
    describe   : "Output directory for downloaded manga",
    default    : "./",
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

if ( argv._[0] ) { // <manga> passed
  downloadManga( argv._[0], argv.out );
} else if ( argv.list ) { // list passed
  // render list of downloaded manga
}
