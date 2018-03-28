const test = require( "ava" );
const path = require( "path" );
const mockery = require( "mockery" );

mockery.enable( { warnOnUnregistered: false, warnOnReplace: false } );
mockery.registerMock( "fs", {
  open : () => {},
  write: () => {},
} );

/* Tests */

const d = require( "./test-data" );
const i = require( "../lib" );

// i.getImgSrcIfValid
test( "get image source", t => i.getImgSrcIfValid( d.baseUrl )
  .then( src => t.is( src, d.imgUrl ) ) );
test( "get error for invalid page", t => i.getImgSrcIfValid( d.siteUrlInvalidPage )
  .then( imgSrc => {
    t.truthy( imgSrc instanceof Error );
    t.is( imgSrc.message, "page" );
  } ) );
test( "get error for invalid chapter", t => i.getImgSrcIfValid( d.siteUrlInvalidChapter )
  .then( imgSrc => {
    t.truthy( imgSrc instanceof Error );
    t.is( imgSrc.message, "chapter" );
  } ) );

// i.createSiteUrl
test( "create base url (no page) from manga data", t =>
  t.is( i.createSiteUrl( d.manga.name, d.manga.chapter, d.manga.page ), d.baseUrl ) );
test( "create site url from manga data", t =>
  t.is( i.createSiteUrl( d.mangaPage39.name, d.mangaPage39.chapter, d.mangaPage39.page ), `${d.baseUrl}/39` ) );

// i.createManga
test( "create manga from base url (no page)", t => i.createManga( d.baseUrl, d.outputPath )
  .then( data => t.deepEqual( data, d.manga ) ) );
test( "create manga from page url", t => i.createManga( `${d.baseUrl}/39`, d.outputPath )
  .then( data => t.deepEqual( data, d.mangaPage39 ) ) );
test( "pass on invalid page error", t => i.createManga( d.siteUrlInvalidPage, d.outputPath )
  .then( data => data.imgSrc )
  .then( imgSrc => {
    t.truthy( imgSrc instanceof Error );
    t.is( imgSrc.message, "page" );
  } ) );
test( "pass on invalid chapter error", t => i.createManga( d.siteUrlInvalidChapter )
  .then( data => data.imgSrc )
  .then( imgSrc => {
    t.truthy( imgSrc instanceof Error );
    t.is( imgSrc.message, "chapter" );
  } ) );

// i.parseFromUrl
test( "parse data from url without page", t =>
  t.deepEqual( i.parseFromUrl( d.baseUrl ), d.mangaBase ) );
test( "parse data from url with page", t =>
  t.deepEqual( i.parseFromUrl( d.mangaPage2.siteUrl ), d.mangaPage2Base ) );

// i.increase
test( "increase chapter for valid url", t => i.increase( d.mangaChapter100 )
  .then( data => t.deepEqual( data, d.mangaChapter101 ) ) );
test( "return null for invalid chapter", t => i.increase( d.mangaInvalidChapter )
  .then( res => t.is( res, null ) ) );

// i.downloadImg
test( "download image and return its buffer", t => i.downloadImg( d.imgUrl )
  .then( buffer => t.is( Buffer.compare( buffer, d.testBuffer ), 0, "Buffers don't match" ) ) );

// i.createZip
test( "create zip from array of buffers", t =>
  i.createZip( [ d.testBuffer ], d.manga.name, d.manga.chapter, d.outputPath )
    .then( zipPath => t.is( zipPath, path.resolve( __dirname, `${d.manga.name}-${d.manga.chapter}.cbz` ) ) ) );

// i.getLastChapter
test( "get last chapter", t => i.getLastChapter( d.mangaLastChapter.name )
  .then( chapter => t.is( chapter, d.mangaLastChapter.chapter ) )
);

// i.getLastPage
test( "get last page", t => i.getLastPage( d.manga.siteUrl )
  .then( page => t.is( page, 39 ) )
);
