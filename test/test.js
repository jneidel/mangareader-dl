const test = require( "ava" );
const path = require( "path" );
const mockery = require( "mockery" );
const fs = require( "mz/fs" );
const DotJson = require( "dot-json" );

mockery.enable( { warnOnUnregistered: false, warnOnReplace: false } );
mockery.registerMock( "fs", {
  open : () => {},
  write: () => {},
} );

/* Tests */

const i = require( "../lib" );

// i.getImgSrcIfValid
test( "get mr image source", t =>
  i.getImgSrcIfValid( "https://www.mangareader.net/shingeki-no-kyojin/103", "mangareader" )
    .then( src => t.is( src, "https://i997.mangareader.net/shingeki-no-kyojin/103/shingeki-no-kyojin-10410955.jpg" ) )
);
test( "get error for invalid mr page", t =>
  i.getImgSrcIfValid( "https://www.mangareader.net/shingeki-no-kyojin/103/40", "mangareader" ) // Last page is 39
    .then( imgSrc => {
      t.truthy( imgSrc instanceof Error );
      t.is( imgSrc.message, "page" );
    } )
);
test( "get error for invalid mr chapter", t =>
  i.getImgSrcIfValid( "https://www.mangareader.net/shingeki-no-kyojin/250", "mangareader" )
    .then( imgSrc => {
      t.truthy( imgSrc instanceof Error );
      t.is( imgSrc.message, "chapter" );
    } )
);
test( "get rm image source", t =>
  i.getImgSrcIfValid( "https://www.readmng.com/platinum-end/19/1", "readmng" )
    .then( src => t.is( src, "https://www.funmanga.com/uploads/chapters/15537/22/1.jpg?u=" ) )
);
test( "get error for invalid rm page", t =>
  i.getImgSrcIfValid( "https://www.readmng.com/platinum-end/19/41", "readmng" ) // Last page is 40
    .then( imgSrc => {
      t.truthy( imgSrc instanceof Error );
      t.is( imgSrc.message, "page" );
    } )
);
test( "get error for invalid rm chapter", t =>
  i.getImgSrcIfValid( "https://www.readmng.com/naruto/701/1", "readmng" ) // Last is 700
    .then( imgSrc => {
      t.truthy( imgSrc instanceof Error );
      t.is( imgSrc.message, "chapter" );
    } )
);

// i.createUrl
test( "create mr url without page [unit]", t =>
  t.is(
    i.createUrl( "mangareader", "shingeki-no-kyojin", 103 ),
    "https://www.mangareader.net/shingeki-no-kyojin/103/1"
  )
);
test( "create mr url with page [unit]", t =>
  t.is(
    i.createUrl( "mangareader", "shingeki-no-kyojin", 103, 39 ),
    "https://www.mangareader.net/shingeki-no-kyojin/103/39"
  )
);
test( "create rm url with page [unit]", t =>
  t.is(
    i.createUrl( "readmng", "platinum-end", 19, 4 ),
    "https://www.readmng.com/platinum-end/19/4"
  )
);

// i.createManga
test( "create manga from mr url", t =>
  i.createManga( "https://www.mangareader.net/shingeki-no-kyojin/103", __dirname, "mangareader" )
    .then( data => t.deepEqual( data, {
      name      : "shingeki-no-kyojin",
      chapter   : 103,
      page      : 1,
      provider  : "mangareader",
      url       : "https://www.mangareader.net/shingeki-no-kyojin/103/1",
      imgSrc    : "https://i997.mangareader.net/shingeki-no-kyojin/103/shingeki-no-kyojin-10410955.jpg",
      outputPath: __dirname,
    } ) )
);
test( "pass on invalid page error", t =>
  i.createManga( "https://www.mangareader.net/shingeki-no-kyojin/103/40", __dirname, "mangareader" )
    .then( data => data.imgSrc )
    .then( imgSrc => {
      t.truthy( imgSrc instanceof Error );
      t.is( imgSrc.message, "page" );
    } )
);
test( "pass on invalid chapter error", t =>
  i.createManga( "https://www.mangareader.net/shingeki-no-kyojin/250", __dirname, "mangareader" )
    .then( data => data.imgSrc )
    .then( imgSrc => {
      t.truthy( imgSrc instanceof Error );
      t.is( imgSrc.message, "chapter" );
    } )
);
test( "create manga from rm url", t =>
  i.createManga( "https://www.readmng.com/platinum-end/19/1", __dirname, "readmng" )
    .then( data => t.deepEqual( data, {
      name      : "platinum-end",
      chapter   : 19,
      page      : 1,
      provider  : "readmng",
      url       : "https://www.readmng.com/platinum-end/19/1",
      imgSrc    : "https://www.funmanga.com/uploads/chapters/15537/22/1.jpg?u=",
      outputPath: __dirname,
    } ) )
);

// i.parseFromUrl
test( "parse full mr url [unit]", t =>
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
test( "parse full rm url [unit]", t =>
  t.deepEqual( i.parseFromUrl( "https://www.readmng.com/platinum-end/19/2" ), {
    name    : "platinum-end",
    chapter : 19,
    page    : 2,
    provider: "readmng",
  } )
);
test( "parse url without www.readmng.com [unit]", t =>
  t.deepEqual( i.parseFromUrl( "platinum-end/19/2", "readmng" ), {
    name    : "platinum-end",
    chapter : 19,
    page    : 2,
    provider: "readmng",
  } )
);

// i.increase
test( "increase chapter for valid mr url", t =>
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
test( "increase chapter for valid rm url", t =>
  i.increase( {
    name    : "platinum-end",
    chapter : 19,
    page    : 1,
    provider: "readmng",
    imgSrc  : "https://www.funmanga.com/uploads/chapters/15537/22/1.jpg?u=",
    url     : "https://www.readmng.com/platinum-end/19",
  } )
    .then( data => t.deepEqual( data, {
      name    : "platinum-end",
      chapter : 20,
      page    : 1,
      provider: "readmng",
      imgSrc  : "https://www.funmanga.com/uploads/chapters/15537/23/1.jpg?u=",
      url     : "https://www.readmng.com/platinum-end/20/1",
    } ) )
);

const testBuffer = fs.readFileSync( path.resolve( __dirname, "test-img.jpg" ) );

// i.downloadImg
test( "download image and return its buffer", t =>
  i.downloadImg( "https://i997.mangareader.net/shingeki-no-kyojin/103/shingeki-no-kyojin-10410955.jpg" )
    .then( buffer => t.is( Buffer.compare( buffer, testBuffer ), 0, "Buffers don't match" ) )
);

// i.createZip
test( "create zip from array of buffers [unit]", t =>
  i.createZip(
    [ testBuffer ],
    "shingeki-no-kyojin",
    103,
    __dirname
  )
    .then( zipPath => t.is(
      zipPath,
      path.resolve( __dirname, "shingeki-no-kyojin-103.cbz" ) )
    )
);

// i.getLastChapter
test( "get last chapter mr", t =>
  i.getLastChapter( "naruto", "mangareader" )
    .then( chapter => t.is( chapter, 700 ) )
);
test( "get last chapter rm", t =>
  i.getLastChapter( "naruto", "readmng" )
    .then( chapter => t.is( chapter, 700 ) )
);

// i.getLastPage
test( "get last page for mr url", t =>
  i.getLastPage( "https://www.mangareader.net/shingeki-no-kyojin/103" )
    .then( page => t.is( page, 39 ) )
);
test( "get last page for rm url", t =>
  i.getLastPage( "https://www.readmng.com/platinum-end/19/1" )
    .then( page => t.is( page, 40 ) )
);

// i.writeHistory
test.serial( "write manga to history [unit]", async t => {
  const historyPath = path.resolve( __dirname, "mangareader-dl.history.json" );
  const history = new DotJson( historyPath );

  history
    .set( "shingeki-no-kyojin.chapter", "" )
    .set( "shingeki-no-kyojin.path", "" )
    .set( "shingeki-no-kyojin.provider", "" )
    .save();

  i.writeHistory( {
    name    : "shingeki-no-kyojin",
    chapter : 103,
    provider: "mangareader",
    path    : "/Users/jneidel/code/mangareader-dl/test",
  }, historyPath );

  const data = await fs.readFile( historyPath, { encoding: "utf8" } );

  t.deepEqual( JSON.parse( data ), {
    "shingeki-no-kyojin": {
      chapter : 103,
      provider: "mangareader",
      path    : "/Users/jneidel/code/mangareader-dl/test",
    } } );
} );

// i.readHistory
test.serial( "read manga history for given name [unit]", t => {
  const historyPath = path.resolve( __dirname, "mangareader-dl.history.json" );
  const history = new DotJson( historyPath );

  history
    .set( "shingeki-no-kyojin.chapter", 102 )
    .set( "shingeki-no-kyojin.path", "/Users/jneidel/code/mangareader-dl/test" )
    .set( "shingeki-no-kyojin.provider", "mangareader" )
    .save();

  const { chapter, provider, path: mangaPath } = i.readHistory( "shingeki-no-kyojin", historyPath );

  t.is( chapter, 102 );
  t.is( mangaPath, "/Users/jneidel/code/mangareader-dl/test" );
  t.is( provider, "mangareader" );
} );
