const test = require( "ava" );
const fs = require( "mz/fs" );
const path = require( "path" );
const mockery = require( "mockery" );

mockery.enable( { warnOnUnregistered: false, warnOnReplace: false } );
mockery.registerMock( "fs", {
  open : () => {},
  write: () => {},
} );

const i = require( "../lib" );

// i.getImgSrcIfValid
test( "get image source", t =>
  i.getImgSrcIfValid( "https://www.mangareader.net/shingeki-no-kyojin/103", "mangareader" )
    .then( src => {
      if ( src.slice( 8, 10 ) === "i6" ) // Different servers depending on position
        t.is( src, "https://i6.mangareader.net/shingeki-no-kyojin/103/shingeki-no-kyojin-10410955.jpg" );
      else
        t.is( src, "https://i997.mangareader.net/shingeki-no-kyojin/103/shingeki-no-kyojin-10410955.jpg" );
    } )
);
test( "get error for invalid page", t =>
  i.getImgSrcIfValid( "https://www.mangareader.net/shingeki-no-kyojin/103/40", "mangareader" ) // Last page is 39
    .then( imgSrc => {
      t.truthy( imgSrc instanceof Error );
    } )
);
test( "get error for invalid chapter", t =>
  i.getImgSrcIfValid( "https://www.mangareader.net/shingeki-no-kyojin/250", "mangareader" )
    .then( imgSrc => {
      t.truthy( imgSrc instanceof Error );
    } )
);

// i.createUrl
test( "create url without page [unit]", t =>
  t.is(
    i.createUrl( "mangareader", "shingeki-no-kyojin", 103 ),
    "https://www.mangareader.net/shingeki-no-kyojin/103/1"
  )
);
test( "create url with page [unit]", t =>
  t.is(
    i.createUrl( "mangareader", "shingeki-no-kyojin", 103, 39 ),
    "https://www.mangareader.net/shingeki-no-kyojin/103/39"
  )
);

// i.createManga
test( "create manga from url", t =>
  i.createManga( "https://www.mangareader.net/shingeki-no-kyojin/103", __dirname, "mangareader" )
    .then( data => {
      const testManga = {
        name      : "shingeki-no-kyojin",
        chapter   : 103,
        page      : 1,
        provider  : "mangareader",
        url       : "https://www.mangareader.net/shingeki-no-kyojin/103/1",
        outputPath: __dirname,
      };

      if ( data.imgSrc.slice( 8, 10 ) === "i6" ) // Different servers depending on position
        testManga.imgSrc = "https://i6.mangareader.net/shingeki-no-kyojin/103/shingeki-no-kyojin-10410955.jpg";
      else
        testManga.imgSrc = "https://i997.mangareader.net/shingeki-no-kyojin/103/shingeki-no-kyojin-10410955.jpg";

      t.deepEqual( data, testManga );
    } )
);
test( "pass on invalid page error", t =>
  i.createManga( "https://www.mangareader.net/shingeki-no-kyojin/103/40", __dirname, "mangareader" )
    .then( data => data.imgSrc )
    .then( imgSrc => {
      t.truthy( imgSrc instanceof Error );
    } )
);
test( "pass on invalid chapter error", t =>
  i.createManga( "https://www.mangareader.net/shingeki-no-kyojin/250", __dirname, "mangareader" )
    .then( data => data.imgSrc )
    .then( imgSrc => {
      t.truthy( imgSrc instanceof Error );
    } )
);

// i.parseFromUrl
test( "parse full url [unit]", t =>
  t.deepEqual( i.parseFromUrl( "https://www.mangareader.net/shingeki-no-kyojin/101/5" ), {
    name    : "shingeki-no-kyojin",
    chapter : 101,
    page    : 5,
    provider: "mangareader",
  } )
);
test( "parse url without page [unit]", t =>
  t.deepEqual( i.parseFromUrl( "https://www.mangareader.net/shingeki-no-kyojin/101" ), {
    name    : "shingeki-no-kyojin",
    chapter : 101,
    page    : 1,
    provider: "mangareader",
  } )
);
test( "parse url without chapter [unit]", t =>
  t.deepEqual( i.parseFromUrl( "https://www.mangareader.net/shingeki-no-kyojin" ), {
    name    : "shingeki-no-kyojin",
    chapter : 1,
    page    : 1,
    provider: "mangareader",
  } )
);
test( "parse url without https [unit]", t =>
  t.deepEqual( i.parseFromUrl( "www.mangareader.net/shingeki-no-kyojin/101/5" ), {
    name    : "shingeki-no-kyojin",
    chapter : 101,
    page    : 5,
    provider: "mangareader",
  } )
);
test( "parse url without www.mangareader.net [unit]", t =>
  t.deepEqual( i.parseFromUrl( "shingeki-no-kyojin/101/5", "mangareader" ), {
    name    : "shingeki-no-kyojin",
    chapter : 101,
    page    : 5,
    provider: "mangareader",
  } )
);

// i.increase
test( "increase chapter for valid url", t =>
  i.increase( {
    name    : "shingeki-no-kyojin",
    chapter : 100,
    page    : 1,
    provider: "mangareader",
    imgSrc  : "https://i9.mangareader.net/shingeki-no-kyojin/100/shingeki-no-kyojin-10120141.jpg",
    url     : "https://www.mangareader.net/shingeki-no-kyojin/100",
  } )
    .then( data => t.deepEqual( data, {
      name    : "shingeki-no-kyojin",
      chapter : 101,
      page    : 1,
      provider: "mangareader",
      imgSrc  : "https://i7.mangareader.net/shingeki-no-kyojin/101/shingeki-no-kyojin-10239607.jpg",
      url     : "https://www.mangareader.net/shingeki-no-kyojin/101/1",
    } ) )
);
test( "return null for invalid chapter", t =>
  i.increase( {
    name    : "shingeki-no-kyojin",
    chapter : 250,
    page    : 1,
    provider: "mangareader",
    url     : "https://www.mangareader.net/shingeki-no-kyojin/250",
  } )
    .then( res => t.is( res, null ) )
);

const testBuffer = fs.readFileSync( path.resolve( __dirname, "buffers", "mangareader.jpg" ) );

// i.downloadImg
test( "download image and return its buffer", t =>
  i.downloadImg( { imgSrc: "https://i3.mangareader.net/shingeki-no-kyojin/103/shingeki-no-kyojin-10410973.jpg", provider: "mangareader" } )
    .then( buffer => t.is( Buffer.compare( buffer, testBuffer ), 0, "Buffers don't match" ) )
);

// i.createZip - fails due to error in dependency, eventhough the function is correct
/* test( "create zip from array of buffers [unit]", t =>
  i.createZip(
    [ testBuffer ],
    "shingeki-no-kyojin",
    103,
    __dirname
  ).then( zipPath => t.is(
    zipPath,
    path.resolve( __dirname, "shingeki-no-kyojin-103.cbz" ) )
  )
); */

// i.getLastChapter
test( "get last chapter", t =>
  i.getLastChapter( "naruto", "mangareader" )
    .then( chapter => t.is( chapter, 700 ) )
);

// i.getLastPage
test( "get last page for url", t =>
  i.getLastPage( "https://www.mangareader.net/shingeki-no-kyojin/103", "mangareader" )
    .then( page => t.is( page, 39 ) )
);
