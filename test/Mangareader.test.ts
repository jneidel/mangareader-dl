import { readFile } from "fs";
import { promisify } from "util";
import { resolve as pathResolve } from "path";
const fsReadFile = promisify( readFile );

import Mangareader from "../providers/Mangareader";
import Manga, { PageManga } from "../providers/Manga";

const mangareader = new Mangareader();

test( "initiate", () => {
  expect( mangareader.name ).toBe( "mangareader" );
  expect( mangareader.extension ).toBe( "net" );
} );

test( "parseShortUrl", () => {
  const url = "shingeki-no-kyojin/103/39";
  const answer = new PageManga( {
    name    : "shingeki-no-kyojin",
    chapter : 103,
    page    : 39,
    provider: mangareader,
  } );

  const result = mangareader.parseShortUrl( url );
  expect( result ).toEqual( answer );
} );

test( "createUrl", () => {
  const manga = new PageManga( {
    name    : "shingeki-no-kyojin",
    chapter : 103,
    page    : 39,
    provider: mangareader,
  } );
  const answer = "https://www.mangareader.net/shingeki-no-kyojin/103/39";

  const result = mangareader.createUrl( manga );
  expect( result ).toBe( answer );
} );
test( "createUrl as overview url", () => {
  const manga = new PageManga( {
    name    : "shingeki-no-kyojin",
    provider: mangareader,
  } );
  const answer = "https://www.mangareader.net/shingeki-no-kyojin";

  const result = mangareader.createUrl( manga, true );
  expect( result ).toBe( answer );
} );

test( "exists", async () => {
  const manga = new Manga( { name: "naruto", provider: mangareader } );
  const answer = true;

  const result = await mangareader.exists( manga );
  expect( result ).toBe( answer );
} );
test( "exists with invalid name", async () => {
  const manga = new Manga( { name: "undefined", provider: mangareader } );
  const answer = false;

  const result = await mangareader.exists( manga );
  expect( result ).toBe( answer );
} );

test( "getLastPage", async () => {
  const manga = new Manga( {
    name    : "shingeki-no-kyojin",
    chapter : 103,
    provider: mangareader,
  } );
  const answer = 39;

  const result = await mangareader.getLastPage( manga );
  expect( result ).toBe( answer );
} );

test( "getLastChapter", async () => {
  const manga = new Manga( { name: "naruto", provider: mangareader } );
  const answer = 700;

  const result = await mangareader.getLastChapter( manga );
  expect( result ).toBe( answer );
} );
test( "getLastChapter with number in manga name", async () => {
  const manga = new Manga( {
    name    : "jojos-bizarre-adventure-part-1-phantom-blood",
    provider: mangareader,
  } );
  const answer = 5;

  const result = await mangareader.getLastChapter( manga );
  expect( result ).toBe( answer );
} );

test( "getImageSource", async () => {
  const manga = new PageManga( {
    name    : "shingeki-no-kyojin",
    chapter : 103,
    page    : 1,
    provider: mangareader,
  } );

  // Different servers depending on location
  const answer1 =
    "https://i6.mangareader.net/shingeki-no-kyojin/103/shingeki-no-kyojin-10410955.jpg";
  const answer2 =
    "https://i997.mangareader.net/shingeki-no-kyojin/103/shingeki-no-kyojin-10410955.jpg";

  const result = await mangareader.getImageSource( manga );
  if ( String( result ).match( /i6/ ) ) expect( result ).toBe( answer1 );
  else expect( result ).toBe( answer2 );
} );

test( "getImageSource of invalid page", async () => {
  const manga = new PageManga( {
    name    : "shingeki-no-kyojin",
    chapter : 103,
    page    : 40, // Last page is 39
    provider: mangareader,
  } );
  const error = new Error( "invalid page" );

  async function fn() {
    await mangareader.getImageSource( manga );
  }

  await expect( fn() ).rejects.toThrow( error );
} );

test( "getImageBuffer", async () => {
  const testBuffer = await fsReadFile(
    pathResolve( __dirname, "buffers", "mangareader.jpg" ),
  );

  const imageSource =
    "https://i6.mangareader.net/shingeki-no-kyojin/103/shingeki-no-kyojin-10410955.jpg";
  const answerBuffer = await mangareader.getImageBuffer( imageSource );

  expect( testBuffer.equals( answerBuffer ) ).toBeTruthy();
} );
