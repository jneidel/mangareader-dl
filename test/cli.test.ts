import execa from "execa";

import { promisify } from "util";
import { readFile } from "fs";
const readFileAsync = promisify( readFile );
import { resolve } from "path";

async function cli( commands: string[] ) {
  const cliFileLocation = resolve( __dirname, "..", "dist", "bin", "cli.js" );

  const { stdout } = await execa( "node", [ cliFileLocation ].concat( commands ) );
  return stdout;
}

test( "version flags", async () => {
  const pkgJson = await readFileAsync(
    resolve( __dirname, "..", "package.json" ),
    { encoding: "utf8" },
  );
  const currentVersion = JSON.parse( pkgJson ).version;

  const results: any = await Promise.all( [
    cli( [ "--version" ] ),
    cli( [ "-v" ] ),
    cli( [ "list", "-v" ] ),
  ] );

  results.forEach( result => {
    const version = result.match( /v(\d.\d.\d)/ )[1];
    expect( version ).toBe( currentVersion );

    expect( result ).toMatch( /GPL/ );
  } );
} );

test( "--help", async () => {
  const results: any = await Promise.all( [ cli( [ "--help" ] ), cli( [] ), cli( [ "" ] ) ] );

  results.forEach( result => {
    expect( result ).toMatch( /d, download/ );
    expect( result ).toMatch( /l, list/ );
    expect( result ).toMatch( /u, update/ );
  } );
} );
test( "download --help", async () => {
  const results: any = await Promise.all( [
    cli( [ "download", "--help" ] ),
    cli( [ "d", "-h" ] ),
  ] );

  results.forEach( result => {
    expect( result ).toMatch( /PROVIDERS/ );
    expect( result ).not.toMatch( /SUBCOMMANDS/ );

    expect( result ).toMatch( /--out/ );
  } );
} );
test( "list --help", async () => {
  const results: any = await Promise.all( [
    cli( [ "list", "--help" ] ),
    cli( [ "l", "-h" ] ),
  ] );

  results.forEach( result => {
    expect( result ).toMatch( /SUBCOMMANDS/ );
  } );
} );
test( "update --help", async () => {
  const results: any = await Promise.all( [
    cli( [ "update", "--help" ] ),
    cli( [ "u", "-h" ] ),
  ] );

  results.forEach( result => {
    expect( result ).toMatch( /SUBCOMMANDS/ );
  } );
} );

test( "unknown flag crashes gracefully", async () => {
  const result = await cli( [ "--does-not-exist" ] );

  expect( result ).toMatch( /Flag '--does-not-exist' does not exist/ );
} );

test( "catch invalid passed path", async () => {
  const results = await Promise.all( [
    cli( [ "d", "-c", "--dir" ] ), // flag
    cli( [ "d", "-c", "" ] ), // empty
    cli( [ "d", "-o" ] ), // undefined
    cli( [ "d", "-o", "https://www.mangareader.net/naruto/1" ] ), // manga-url
  ] );

  expect( results[0] ).toMatch( /Invalid --config argument \(path\): '--dir'/ );
  expect( results[1] ).toMatch( /Invalid --config argument \(path\): ''/ );
  expect( results[2] ).toMatch( /Invalid --out argument \(path\): 'undefined'/ );
  expect( results[3] ).toMatch( /Invalid --out argument \(path\): 'https:\/\/www.mangareader.net\/naruto\/1'/ );
} );

test( "catch invalid passed provider", async () => {
  const result = await cli( [ "d", "-p", "does-not-exist" ] )

  expect( result ).toMatch( /Invalid provider: 'does-not-exist'/ );
} );

