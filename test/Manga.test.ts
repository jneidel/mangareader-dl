import Manga from "../providers/Manga";
import Mangareader from "../providers/Mangareader";

const mangareader = new Mangareader();

test( "exists", async () => {
  const manga = new Manga( {
    name: "shingeki-no-kyojin",
    chapter: 103,
    provider: mangareader,
  } );
  const answer = true

  const result = await manga.exists();
  expect( result ).toBe( answer );
} );

test( "lastPage", async () => {
  const manga = new Manga( {
    name: "shingeki-no-kyojin",
    chapter: 103,
    provider: mangareader,
  } );
  const answer = 39

  const result = await manga.lastPage;
  expect( result ).toBe( answer );
} );

test( "lastChapter", async () => {
  const manga = new Manga( {
    name: "naruto",
    provider: mangareader,
  } );
  const answer = 700

  const result = await manga.lastChapter;
  expect( result ).toBe( answer );
} );

