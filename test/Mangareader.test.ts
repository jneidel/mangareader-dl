import { readFileSync as fsReadFileSync } from "fs";
import { resolve as pathResolve } from "path";

import { Mangareader } from "../providers";

const mangareader = new Mangareader();

test( "initiate", () => {
  expect( mangareader.name ).toBe( "mangareader" );
  expect( mangareader.extension ).toBe( "net" );
} );

test( "parseShortUrl", () => {
  const url = "shingeki-no-kyojin/103/39";
  const answer = new mangareader.Manga( {
    name   : "shingeki-no-kyojin",
    chapter: 103,
  } );

  const result = mangareader.parseShortUrl( url );
  expect( result.name ).toBe( answer.name );
  expect( result.chapter ).toBe( answer.chapter );
} );

test( "createUrl", () => {
  const manga = new mangareader.Manga( {
    name   : "shingeki-no-kyojin",
    chapter: 103,
  } );
  const page = new manga.Page( 39 );
  const answer = "https://www.mangareader.net/shingeki-no-kyojin/103/39";

  expect( page.url ).toBe( answer );
} );
test( "createUrl as overview url", () => {
  const manga = new mangareader.Manga( {
    name: "shingeki-no-kyojin",
  } );
  const page = new manga.Page();
  const answer = "https://www.mangareader.net/shingeki-no-kyojin";

  const result = page.createUrl( true );
  expect( result ).toBe( answer );
} );

test( "exists", async () => {
  const manga = new mangareader.Manga( { name: "naruto" } );
  const answer = true;

  const result = await manga.exists();
  expect( result ).toBe( answer );
} );
test( "exists with invalid name", async () => {
  const manga = new mangareader.Manga( { name: "undefined" } );
  const answer = false;

  const result = await manga.exists();
  expect( result ).toBe( answer );
} );

test( "getLastPage", async () => {
  const manga = new mangareader.Manga( {
    name   : "shingeki-no-kyojin",
    chapter: 103,
  } );
  const answer = 39;

  const result = await manga.lastPage;
  expect( result ).toBe( answer );
} );

test( "getLastChapter", async () => {
  const manga = new mangareader.Manga( { name: "naruto" } );
  const answer = 700;

  const result = await manga.lastChapter;
  expect( result ).toBe( answer );
} );
test( "getLastChapter with number in manga name", async () => {
  const manga = new mangareader.Manga( {
    name: "jojos-bizarre-adventure-part-1-phantom-blood",
  } );
  const answer = 5;

  const result = await manga.lastChapter;
  expect( result ).toBe( answer );
} );

test( "getImageSource", async () => {
  const manga = new mangareader.Manga( {
    name   : "shingeki-no-kyojin",
    chapter: 103,
  } );
  const page = new manga.Page( 1 );

  // Different servers depending on location
  const answer1 =
    "https://i6.mangareader.net/shingeki-no-kyojin/103/shingeki-no-kyojin-10410955.jpg";
  const answer2 =
    "https://i997.mangareader.net/shingeki-no-kyojin/103/shingeki-no-kyojin-10410955.jpg";

  const result = await page.getImageSource();
  if ( String( result ).match( /i6/ ) ) expect( result ).toBe( answer1 );
  else expect( result ).toBe( answer2 );
} );
test( "getImageSource of invalid page", async () => {
  const manga = new mangareader.Manga( {
    name   : "shingeki-no-kyojin",
    chapter: 103,
  } );
  const page = new manga.Page( 40 ); // Last page is 39
  const error = new Error( "invalid page" );

  async function fn() {
    await page.getImageSource();
  }

  await expect( fn() ).rejects.toThrow( error );
} );

const testBuffer = fsReadFileSync(
  pathResolve( __dirname, "buffers", "mangareader.jpg" ),
);

test( "getImageBuffer", async () => {
  const imageSource =
    "https://i6.mangareader.net/shingeki-no-kyojin/103/shingeki-no-kyojin-10410955.jpg";
  const answerBuffer = await mangareader.getImageBuffer( imageSource );

  expect( testBuffer.equals( answerBuffer ) ).toBeTruthy();
} );
test( "getImageBuffer with source from getImageSource", async () => {
  const manga = new mangareader.Manga( {
    name   : "shingeki-no-kyojin",
    chapter: 103,
  } );
  const page = new manga.Page( 1 );

  const imageSource = await page.getImageSource();
  const answerBuffer = await page.getImageBuffer( imageSource );

  expect( testBuffer.equals( answerBuffer ) ).toBeTruthy();
} );
