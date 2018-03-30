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
test.skip( "get image source", t =>
  i.getImgSrcIfValid( "https://www.mangareader.net/shingeki-no-kyojin/103" )
    .then( src => t.is( src, "https://i997.mangareader.net/shingeki-no-kyojin/103/shingeki-no-kyojin-10410955.jpg" ) )
);
test.skip( "get error for invalid page", t =>
  i.getImgSrcIfValid( "https://www.mangareader.net/shingeki-no-kyojin/103/40" ) // Last page is 39
    .then( imgSrc => {
      t.truthy( imgSrc instanceof Error );
      t.is( imgSrc.message, "page" );
    } )
);
test.skip( "get error for invalid chapter", t =>
  i.getImgSrcIfValid( "https://www.mangareader.net/shingeki-no-kyojin/250" )
    .then( imgSrc => {
      t.truthy( imgSrc instanceof Error );
      t.is( imgSrc.message, "chapter" );
    } )
);

// i.createSiteUrl
test( "create url without page", t =>
  t.is(
    i.createSiteUrl( "shingeki-no-kyojin", 103 ),
    "https://www.mangareader.net/shingeki-no-kyojin/103/1"
  )
);
test( "create url with page", t =>
  t.is(
    i.createSiteUrl( "shingeki-no-kyojin", 103, 39 ),
    "https://www.mangareader.net/shingeki-no-kyojin/103/39"
  )
);

// i.createManga
test.skip( "create manga from url", t =>
  i.createManga( "https://www.mangareader.net/shingeki-no-kyojin/103", __dirname )
    .then( data => t.deepEqual( data, {
      name      : "shingeki-no-kyojin",
      chapter   : 103,
      page      : 1,
      siteUrl   : "https://www.mangareader.net/shingeki-no-kyojin/103/1",
      imgSrc    : "https://i997.mangareader.net/shingeki-no-kyojin/103/shingeki-no-kyojin-10410955.jpg",
      outputPath: __dirname,
    } ) )
);
test.skip( "pass on invalid page error", t =>
  i.createManga( "https://www.mangareader.net/shingeki-no-kyojin/103/40", __dirname )
    .then( data => data.imgSrc )
    .then( imgSrc => {
      t.truthy( imgSrc instanceof Error );
      t.is( imgSrc.message, "page" );
    } )
);
test.skip( "pass on invalid chapter error", t =>
  i.createManga( "https://www.mangareader.net/shingeki-no-kyojin/250", __dirname )
    .then( data => data.imgSrc )
    .then( imgSrc => {
      t.truthy( imgSrc instanceof Error );
      t.is( imgSrc.message, "chapter" );
    } )
);

// i.parseFromUrl
test( "parse full url", t =>
  t.deepEqual( i.parseFromUrl( "https://www.mangareader.net/shingeki-no-kyojin/101/5" ), {
    name   : "shingeki-no-kyojin",
    chapter: 101,
    page   : 5,
    siteUrl: "https://www.mangareader.net/shingeki-no-kyojin/101/5",
  } )
);
test( "parse url without page", t =>
  t.deepEqual( i.parseFromUrl( "https://www.mangareader.net/shingeki-no-kyojin/101" ), {
    name   : "shingeki-no-kyojin",
    chapter: 101,
    page   : 1,
    siteUrl: "https://www.mangareader.net/shingeki-no-kyojin/101/1",
  } )
);
test( "parse url without chapter", t =>
  t.deepEqual( i.parseFromUrl( "https://www.mangareader.net/shingeki-no-kyojin" ), {
    name   : "shingeki-no-kyojin",
    chapter: 1,
    page   : 1,
    siteUrl: "https://www.mangareader.net/shingeki-no-kyojin/1/1",
  } )
);
test( "parse url without https", t =>
  t.deepEqual( i.parseFromUrl( "www.mangareader.net/shingeki-no-kyojin/101/5" ), {
    name   : "shingeki-no-kyojin",
    chapter: 101,
    page   : 5,
    siteUrl: "https://www.mangareader.net/shingeki-no-kyojin/101/5",
  } )
);
test( "parse url without www.mangareader.net", t =>
  t.deepEqual( i.parseFromUrl( "shingeki-no-kyojin/101/5" ), {
    name   : "shingeki-no-kyojin",
    chapter: 101,
    page   : 5,
    siteUrl: "https://www.mangareader.net/shingeki-no-kyojin/101/5",
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
test.skip( "return null for invalid chapter", t =>
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
test.skip( "download image and return its buffer", t =>
  i.downloadImg( "https://i997.mangareader.net/shingeki-no-kyojin/103/shingeki-no-kyojin-10410955.jpg" )
    .then( buffer => t.is( Buffer.compare( buffer, testBuffer ), 0, "Buffers don't match" ) )
);

// i.createZip
test( "create zip from array of buffers", t =>
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
test.skip( "get last chapter", t =>
  i.getLastChapter( "naruto" )
    .then( chapter => t.is( chapter, 700 ) )
);

// i.getLastPage
test.skip( "get last page", t =>
  i.getLastPage( "https://www.mangareader.net/shingeki-no-kyojin/103" )
    .then( page => t.is( page, 39 ) )
);

// i.writeConfig
test.serial( "write output path to config", async t => {
  const configPath = path.resolve( __dirname, "mangareader-dl.config.json" );
  const config = new DotJson( configPath );

  config.set( "outputPath", "" );

  i.writeConfig( { outputPath: __dirname }, configPath );

  const data = await fs.readFile( configPath, { encoding: "utf8" } );

  t.deepEqual( JSON.parse( data ), { outputPath: __dirname } );
} );

test.serial( "write manga to history", async t => {
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

test.serial( "read manga history for given name", t => {
  const historyPath = path.resolve( __dirname, "mangareader-dl.history.json" );
  const history = new DotJson( historyPath );

  history.set( "shingeki-no-kyojin.chapter", 103 ).save();
  history.set( "shingeki-no-kyojin.path", "/Users/jneidel/code/mangareader-dl/test" ).save();

  const { chapter, path: mangaPath } = i.readHistory( "shingeki-no-kyojin", historyPath );

  t.is( chapter, 103 );
  t.is( mangaPath, "/Users/jneidel/code/mangareader-dl/test" );
} );
