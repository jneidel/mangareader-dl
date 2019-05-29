import path from "path";
import { readFile as fsReadFile } from "mz/fs";
import { promisify } from "util";
const readFile = promisify( fsReadFile );
import Mangareader from "../providers/Mangareader";

const mangareader = new Mangareader();

test( "exists", async () => {
  const manga = new mangareader.Manga( {
    name   : "shingeki-no-kyojin",
    chapter: 103,
  } );
  const answer = true;

  const result = await manga.exists();
  expect( result ).toBe( answer );
} );

test( "lastPage", async () => {
  const manga = new mangareader.Manga( {
    name   : "shingeki-no-kyojin",
    chapter: 103,
  } );
  const answer = 39;

  const result = await manga.lastPage;
  expect( result ).toBe( answer );
} );

test( "lastChapter", async () => {
  const manga = new mangareader.Manga( {
    name: "naruto",
  } );
  const answer = 700;

  const result = await manga.lastChapter;
  expect( result ).toBe( answer );
} );

test.skip( "createZip", async () => {
  const dir = path.resolve( __dirname, "buffers", "zip-test" );
  const png1 = readFile( `${dir}/1.png`, { encoding: "binary" } );
  const png2 = readFile( `${dir}/2.png`, { encoding: "binary" } );
  const png3 = readFile( `${dir}/3.png`, { encoding: "binary" } );
  await Promise.all( [ png1, png2, png3 ] );

  const buffers = [
    { n: 2, buff: png2 },
    { n: 3, buff: png3 },
    { n: 1, buff: png1 },
  ];

  const manga = new mangareader.Manga( {
    // Any valid Manga obj
    name: "naruto",
    path: dir,
  } );

  console.log( manga.path );
  await manga.createZip( buffers );

  expect( 1 ).toBe( 1 ); // Needs to be checked manually
  // That's why is test is skipped
} );
