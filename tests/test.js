const { test } = require( "ava" );
const path = require( "path" );
const mockery = require( "mockery" );

mockery.enable( { warnOnUnregistered: false, warnOnReplace: false } );
mockery.registerMock( "fs", {
  open : () => {},
  write: () => {},
} );

/* Tests */

const d = require( "./test-data" );
const i = require( "../index" );

// i.getImgSrc
test( "get image source", t => i.getImgSrc( d.baseUrl )
  .then( src => {
    t.falsy( src instanceof Error );
    t.is( src, d.imgUrl );
  } ) );
test( "get error for invalid page", t => i.getImgSrc( d.siteUrlInvalidPage )
  .then( src => {
    t.truthy( src instanceof Error );
    t.is( src.message, "page" );
  } ) );
test( "get error for invalid chapter", t => i.getImgSrc( d.siteUrlInvalidChapter )
  .then( src => {
    t.truthy( src instanceof Error );
    t.is( src.message, "chapter" );
  } ) );

// i.createFilename
test( "create file name", t => t.is( i.createFilename( d.manga ), d.fileName ) );

// i.createSiteUrl
test( "create base url (no page) from manga data", t => t.is( i.createSiteUrl( d.manga ), d.baseUrl ) );
test( "create site url from manga data", t => t.is( i.createSiteUrl( d.mangaPage39 ), `${d.baseUrl}/39` ) );

// i.createManga
test( "create manga from base url (no page)", t => i.createManga( d.baseUrl ).then( data => t.deepEqual( data, d.manga ) ) );
test( "create manga from page url", t => i.createManga( `${d.baseUrl}/39` ).then( data => t.deepEqual( data, d.mangaPage39 ) ) );
test( "pass on invalid page error", t => i.createManga( d.siteUrlInvalidPage ).then( data => data.imgSrc )
  .then( imgSrc => {
    t.truthy( imgSrc instanceof Error );
    t.is( imgSrc.message, "page" );
  } ) );
test( "pass on invalid chapter error", t => i.createManga( d.siteUrlInvalidChapter ).then( data => data.imgSrc )
  .then( imgSrc => {
    t.truthy( imgSrc instanceof Error );
    t.is( imgSrc.message, "chapter" );
  } ) );

// i.parseFromUrl
test( "parse data from url without page", t => t.deepEqual( i.parseFromUrl( d.baseUrl ), d.mangaBase ) );
test( "parse data from url with page", t => t.deepEqual( i.parseFromUrl( d.mangaPage2.siteUrl ), d.mangaPage2Base ) );

// i.increase page
test( "increase page for base url", t => i.increase( "page", d.manga ).then( data => t.deepEqual( data, d.mangaPage2 ) ) );
test( "increase page for page url that is not last page", t => i.increase( "page", d.mangaPage2 ).then( data => t.deepEqual( data, d.mangaPage3 ) ) );
test( "return error for invalid page", t => i.increase( "page", d.mangaPage39 ).then( err => {
  t.truthy( err instanceof Error );
  t.is( err.message, "page" );
} ) );

// i.increase chapter
test( "increase chapter for valid url", t => i.increase( "chapter", d.mangaChapter100 ).then( data => t.deepEqual( data, d.mangaChapter101 ) ) );
test( "return error for invalid chapter", t => i.increase( "chapter", d.mangaInvalidChapter ).then( err => {
  t.truthy( err instanceof Error );
  t.is( err.message, "chapter" );
} ) );

// i.downloadImg
test( "download image and return its buffer", t => i.downloadImg( d.imgUrl )
  .then( async buffer => t.is( Buffer.compare( buffer, d.testBuffer ), 0, "Buffers don't match" ) )
);

// i.createZip
test( "create zip from array of buffers", t => i.createZip( [ d.testBuffer ], d.manga.name, d.manga.chapter, path.resolve( __dirname, `${d.manga.name}-${d.manga.chapter}.cbz` ) )
  .then( zipPath => t.is( zipPath, path.resolve( __dirname, `${d.manga.name}-${d.manga.chapter}.cbz` ) ) )
);
