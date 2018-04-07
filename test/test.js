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
test( "get image source", t =>
  i.getImgSrcIfValid( "https://www.mangareader.net/shingeki-no-kyojin/103" )
    .then( src => t.is( src, "https://i997.mangareader.net/shingeki-no-kyojin/103/shingeki-no-kyojin-10410955.jpg" ) )
);
test( "get error for invalid page", t =>
  i.getImgSrcIfValid( "https://www.mangareader.net/shingeki-no-kyojin/103/40" ) // Last page is 39
    .then( imgSrc => {
      t.truthy( imgSrc instanceof Error );
      t.is( imgSrc.message, "page" );
    } )
);
test( "get error for invalid chapter", t =>
  i.getImgSrcIfValid( "https://www.mangareader.net/shingeki-no-kyojin/250" )
    .then( imgSrc => {
      t.truthy( imgSrc instanceof Error );
      t.is( imgSrc.message, "chapter" );
    } )
);

// i.createSiteUrl
test( "create mr url without page [unit]", t =>
  t.is(
    i.createSiteUrl( "mangareader", "shingeki-no-kyojin", 103 ),
    "https://www.mangareader.net/shingeki-no-kyojin/103/1"
  )
);
test( "create mr url with page [unit]", t =>
  t.is(
    i.createSiteUrl( "mangareader", "shingeki-no-kyojin", 103, 39 ),
    "https://www.mangareader.net/shingeki-no-kyojin/103/39"
  )
);
test( "create rm url with page [unit]", t =>
  t.is(
    i.createSiteUrl( "readmng", "platinum-end", 19, 4 ),
    "https://www.readmng.com/platinum-end/19/4"
  )
);

// i.createManga
test( "create manga from url", t =>
  i.createManga( "https://www.mangareader.net/shingeki-no-kyojin/103", __dirname )
    .then( data => t.deepEqual( data, {
      name      : "shingeki-no-kyojin",
      chapter   : 103,
      page      : 1,
      provider  : "mangareader",
      siteUrl   : "https://www.mangareader.net/shingeki-no-kyojin/103/1",
      imgSrc    : "https://i997.mangareader.net/shingeki-no-kyojin/103/shingeki-no-kyojin-10410955.jpg",
      outputPath: __dirname,
    } ) )
);
test( "pass on invalid page error", t =>
  i.createManga( "https://www.mangareader.net/shingeki-no-kyojin/103/40", __dirname )
    .then( data => data.imgSrc )
    .then( imgSrc => {
      t.truthy( imgSrc instanceof Error );
      t.is( imgSrc.message, "page" );
    } )
);
test( "pass on invalid chapter error", t =>
  i.createManga( "https://www.mangareader.net/shingeki-no-kyojin/250", __dirname )
    .then( data => data.imgSrc )
    .then( imgSrc => {
      t.truthy( imgSrc instanceof Error );
      t.is( imgSrc.message, "chapter" );
    } )
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
  t.deepEqual( i.parseFromUrl( "shingeki-no-kyojin/101/5" ), {
    name    : "shingeki-no-kyojin",
    chapter : 101,
    page    : 5,
    provider: null,
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
  t.deepEqual( i.parseFromUrl( "platinum-end/19/2" ), {
    name    : "platinum-end",
    chapter : 19,
    page    : 2,
    provider: null,
  } )
);

// i.increase
test.skip( "increase chapter for valid url", t =>
  i.increase( {
    name   : "shingeki-no-kyojin",
    chapter: 100,
    page   : 1,
    imgSrc : "https://i9.mangareader.net/shingeki-no-kyojin/100/shingeki-no-kyojin-10120141.jpg",
    siteUrl: "https://www.mangareader.net/shingeki-no-kyojin/100",
  } )
    .then( data => t.deepEqual( data, {
      name   : "shingeki-no-kyojin",
      chapter: 101,
      page   : 1,
      imgSrc : "https://i7.mangareader.net/shingeki-no-kyojin/101/shingeki-no-kyojin-10239607.jpg",
      siteUrl: "https://www.mangareader.net/shingeki-no-kyojin/101/1",
    } ) )
);
test( "return null for invalid chapter", t =>
  i.increase( {
    name   : "shingeki-no-kyojin",
    chapter: 250,
    page   : 1,
    siteUrl: "https://www.mangareader.net/shingeki-no-kyojin/250",
  } )
    .then( res => t.is( res, null ) )
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
test( "get last chapter", t =>
  i.getLastChapter( "naruto" )
    .then( chapter => t.is( chapter, 700 ) )
);

// i.getLastPage
test( "get last page", t =>
  i.getLastPage( "https://www.mangareader.net/shingeki-no-kyojin/103" )
    .then( page => t.is( page, 39 ) )
);

// i.writeConfig
test.serial( "write output path to config [unit]", async t => {
  const configPath = path.resolve( __dirname, "mangareader-dl.config.json" );
  const config = new DotJson( configPath );

  config.set( "outputPath", "" );

  i.writeConfig( { outputPath: __dirname }, configPath );

  const data = await fs.readFile( configPath, { encoding: "utf8" } );

  t.deepEqual( JSON.parse( data ), { outputPath: __dirname } );
} );

test.serial( "write manga to history [unit]", async t => {
  const historyPath = path.resolve( __dirname, "mangareader-dl.history.json" );
  const history = new DotJson( historyPath );

  history.set( "shingeki-no-kyojin.chapter", "" ).save();
  history.set( "shingeki-no-kyojin.path", "" ).save();

  i.writeHistory( {
    name   : "shingeki-no-kyojin",
    chapter: 103,
    path   : "/Users/jneidel/code/mangareader-dl/test",
  }, historyPath );

  const data = await fs.readFile( historyPath, { encoding: "utf8" } );

  t.deepEqual( JSON.parse( data ), {
    "shingeki-no-kyojin": {
      chapter: 103,
      path   : "/Users/jneidel/code/mangareader-dl/test",
    } } );
} );

test.serial( "read manga history for given name [unit]", t => {
  const historyPath = path.resolve( __dirname, "mangareader-dl.history.json" );
  const history = new DotJson( historyPath );

  history.set( "shingeki-no-kyojin.chapter", 102 ).save();
  history.set( "shingeki-no-kyojin.path", "/Users/jneidel/code/mangareader-dl/test" ).save();

  const { chapter, path: mangaPath } = i.readHistory( "shingeki-no-kyojin", historyPath );

  t.is( chapter, 102 );
  t.is( mangaPath, "/Users/jneidel/code/mangareader-dl/test" );
} );
