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
    name   : "shingeki-no-kyojin",
    chapter: 103,
    page   : 39,
    provider: mangareader,
  } );

  const result = mangareader.parseShortUrl( url );
  expect( result ).toEqual( answer );
} );

test( "createUrl", () => {
  const data = new PageManga( {
    name   : "shingeki-no-kyojin",
    chapter: 103,
    page   : 39,
    provider: mangareader,
  } );
  const answer = "https://www.mangareader.net/shingeki-no-kyojin/103/39";

  const result = mangareader.createUrl( data );
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
