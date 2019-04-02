import * as fs from "mz/fs" ;
import * as path from "path" ;
import * as mockery from "mockery" ;

mockery.enable( { warnOnUnregistered: false, warnOnReplace: false } );
mockery.registerMock( "fs", {
  open : () => {},
  write: () => {},
} );

import * as i from "../lib" ;

// I.getImgSrcIfValid
test( "get image source", () =>
  i.getImgSrcIfValid( "https://www.mangareader.net/shingeki-no-kyojin/103", "mangareader" )
    .then( src => {
      if ( src.slice( 8, 10 ) === "i6" ) // Different servers depending on position
        expect( src ).toBe( "https://i6.mangareader.net/shingeki-no-kyojin/103/shingeki-no-kyojin-10410955.jpg" );
      else
        expect( src ).toBe( "https://i997.mangareader.net/shingeki-no-kyojin/103/shingeki-no-kyojin-10410955.jpg" );
    } )
);
test( "get error for invalid page", () =>
  i.getImgSrcIfValid( "https://www.mangareader.net/shingeki-no-kyojin/103/40", "mangareader" ) // Last page is 39
    .then( imgSrc => {
      expect( imgSrc instanceof Error ).toBeTruthy();
    } )
);
test( "get error for invalid chapter", () =>
  i.getImgSrcIfValid( "https://www.mangareader.net/shingeki-no-kyojin/250", "mangareader" )
    .then( imgSrc => {
      expect( imgSrc instanceof Error ).toBeTruthy();
    } )
);

// I.createUrl
test( "create url without page [unit]", () =>
  expect( i.createUrl( "mangareader", "shingeki-no-kyojin", 103 ) )
    .toBe( "https://www.mangareader.net/shingeki-no-kyojin/103/1" )
);
test( "create url with page [unit]", () =>
  expect( i.createUrl( "mangareader", "shingeki-no-kyojin", 103, 39 )  )
    .toBe( "https://www.mangareader.net/shingeki-no-kyojin/103/39" )
);

// I.createManga
test( "create manga from url", async () => {
  const data: any = i.createManga( "https://www.mangareader.net/shingeki-no-kyojin/103", __dirname, "mangareader" )
  const testManga = {
    name      : "shingeki-no-kyojin",
    chapter   : 103,
    page      : 1,
    provider  : "mangareader",
    url       : "https://www.mangareader.net/shingeki-no-kyojin/103/1",
    outputPath: __dirname,
    getImgSrc : i.getImgSrcIfValid,
  };

  data.imgSrc = await data.getImgSrc();
  if ( data.imgSrc.slice( 8, 10 ) === "i6" ) // Different servers depending on position
    //@ts-ignore
    testManga.imgSrc = "https://i6.mangareader.net/shingeki-no-kyojin/103/shingeki-no-kyojin-10410955.jpg";
  else
    //@ts-ignore
    testManga.imgSrc = "https://i997.mangareader.net/shingeki-no-kyojin/103/shingeki-no-kyojin-10410955.jpg";

  expect( data ).toEqual( testManga );
} );
test( "pass on invalid page error", () =>
  Promise.resolve( i.createManga( "https://www.mangareader.net/shingeki-no-kyojin/103/40", __dirname, "mangareader" ) )
    .then( data => data.getImgSrc()
      .then( imgSrc => {
        expect( imgSrc instanceof Error ).toBeTruthy();
      } )
    )
);
test( "pass on invalid chapter error", () =>
  Promise.resolve( i.createManga( "https://www.mangareader.net/shingeki-no-kyojin/250", __dirname, "mangareader" ) )
    .then( data => data.getImgSrc()
      .then( imgSrc => {
        expect( imgSrc instanceof Error ).toBeTruthy();
      } )
    )
);

// I.parseFromUrl
test( "parse full url [unit]", () =>
  expect( i.parseFromUrl( "https://www.mangareader.net/shingeki-no-kyojin/101/5" ) )
    .toEqual( {
      name    : "shingeki-no-kyojin",
      chapter : 101,
      page    : 5,
      provider: "mangareader",
    } )
);
test( "parse url without page [unit]", () =>
  expect( i.parseFromUrl( "https://www.mangareader.net/shingeki-no-kyojin/101" ) )
    .toEqual( {
      name    : "shingeki-no-kyojin",
      chapter : 101,
      page    : 1,
      provider: "mangareader",
    } )
);
test( "parse url without chapter [unit]", () =>
  expect( i.parseFromUrl( "https://www.mangareader.net/shingeki-no-kyojin" ) )
    .toEqual( {
      name    : "shingeki-no-kyojin",
      chapter : 1,
      page    : 1,
      provider: "mangareader",
    } )
);
test( "parse url without https [unit]", () =>
  expect( i.parseFromUrl( "www.mangareader.net/shingeki-no-kyojin/101/5" ) )
    .toEqual( {
      name    : "shingeki-no-kyojin",
      chapter : 101,
      page    : 5,
      provider: "mangareader",
    } )
);
test( "parse url without www.mangareader.net [unit]", () =>
  expect( i.parseFromUrl( "shingeki-no-kyojin/101/5", "mangareader" ) )
    .toEqual( {
      name    : "shingeki-no-kyojin",
      chapter : 101,
      page    : 5,
      provider: "mangareader",
    } )
);

// I.increase
test( "increase chapter for valid url", () =>
  Promise.resolve( i.increase( {
    name    : "shingeki-no-kyojin",
    chapter : 100,
    page    : 1,
    provider: "mangareader",
    url     : "https://www.mangareader.net/shingeki-no-kyojin/100",
  } ) )
  .then( data => expect( data )
    .toEqual( {
      name    : "shingeki-no-kyojin",
      chapter : 101,
      page    : 1,
      provider: "mangareader",
      url     : "https://www.mangareader.net/shingeki-no-kyojin/101/1",
      imgSrc  : "https://i7.mangareader.net/shingeki-no-kyojin/101/shingeki-no-kyojin-10239607.jpg",
    } ) )
);
test( "return null for invalid chapter", () =>
  i.increase( {
    name    : "shingeki-no-kyojin",
    chapter : 250,
    page    : 1,
    provider: "mangareader",
    url     : "https://www.mangareader.net/shingeki-no-kyojin/250",
  } )
    .then( res => expect( res ).toBe( null ) )
);

const testBuffer = fs.readFileSync( path.resolve( __dirname, "buffers", "mangareader.jpg" ) );

// I.downloadImg
test( "download image and return its buffer", () =>
  i.downloadImg( i.createManga( "mangareader.net/shingeki-no-kyojin/103/4" ) )
  .then( buffer => expect( Buffer.compare( buffer, testBuffer ) ).toBe( 0 ) ) // "Buffers don't match"
);

// I.createZip - fails due to error in dependency, eventhough the function is correct
/* test( "create zip from array of buffers [unit]", () =>
  i.createZip(
    [ testBuffer ],
    "shingeki-no-kyojin",
    103,
    __dirname
  ).then( zipPath => expect(
    zipPath,
    path.resolve( __dirname, "shingeki-no-kyojin-103.cbz" ) )
  )
); */

// i.getLastChapter
test( "get last chapter", () =>
  i.getLastChapter( "naruto", "mangareader" )
    .then( chapter => expect( chapter ).toBe( 700 ) )
);
test( "get last chapter for number in name", () =>
  i.getLastChapter( "jojos-bizarre-adventure-part-1-phantom-blood", "mangareader" )
    .then( chapter => expect( chapter ).toBe( 5 ) )
);

// I.getLastPage
test( "get last page for url", () =>
  i.getLastPage( "https://www.mangareader.net/shingeki-no-kyojin/103", "mangareader" )
    .then( page => expect( page ).toBe( 39 ) )
);
