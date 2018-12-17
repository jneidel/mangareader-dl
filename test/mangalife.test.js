const test = require( "ava" );

const i = require( "../lib" );

// i.getImgSrcIfValid
test( "get image source", t =>
  i.getImgSrcIfValid( "https://mangalife.us/read-online/Platinum-End-chapter-31-page-1.html", "mangalife" )
    .then( src => t.is( src, "http://93.190.142.23/manga/Platinum-End/0031-001.png" ) )
);
test( "get error for invalid page", t =>
  i.getImgSrcIfValid( "https://mangalife.us/read-online/Platinum-End-chapter-31-page-999.html", "mangainn" )
    .then( imgSrc => {
      t.truthy( imgSrc instanceof Error );
    } )
);

// i.createUrl
test( "create url with page [unit]", t =>
  t.is(
    i.createUrl( "mangalife", "platinum-end", 30, 12 ),
    "https://mangalife.us/read-online/platinum-end-chapter-30-page-12.html"
  )
);

// i.createManga
test( "create manga from reader url [unit]", t =>
  Promise.resolve( i.createManga( "https://mangalife.us/read-online/platinum-end-chapter-30-page-12.html", __dirname, "mangalife" ) )
    .then( data => {
      const testManga = {
        name      : "platinum-end",
        chapter   : 30,
        page      : 12,
        provider  : "mangalife",
        url       : "https://mangalife.us/read-online/platinum-end-chapter-30-page-12.html",
        outputPath: __dirname,
        getImgSrc : i.getImgSrcIfValid,
      };
      t.deepEqual( data, testManga );
    } )
);
test( "create manga from overview url [unit]", t => {
  const manga = i.createManga( "https://mangalife.us/manga/Kemono-Jihen" );

  const testManga = {
    name      : "kemono-jihen",
    chapter   : 1,
    page      : 1,
    provider  : "mangalife",
    url       : "https://mangalife.us/read-online/kemono-jihen-chapter-1-page-1.html",
    outputPath: undefined,
    getImgSrc : i.getImgSrcIfValid,
  };
  t.deepEqual( manga, testManga );
} );
test( "pass on invalid page error [unit]", t =>
  Promise.resolve( i.createManga( "https://mangalife.us/read-online/platinum-end-chapter-30-page-999.html", __dirname, "mangalife" ) )
    .then( manga => manga.getImgSrc()
      .then( imgSrc => {
        t.truthy( imgSrc instanceof Error );
      } )
    )
);

// i.parseFromUrl
test( "parse full url [unit]", t =>
  t.deepEqual( i.parseFromUrl( "http://mangalife.us/read-online/Platinum-End-chapter-31-page-1.html" ), {
    name    : "platinum-end",
    chapter : 31,
    page    : 1,
    provider: "mangalife",
  } )
);
test( "parse url without www.mangalife.us [unit]", t =>
  t.deepEqual( i.parseFromUrl( "platinum-end/31", "mangalife" ), {
    name    : "platinum-end",
    chapter : 31,
    page    : 1,
    provider: "mangalife",
  } )
);

// i.getLastChapter
test( "get last chapter", t =>
  i.getLastChapter( "naruto", "mangalife" )
    .then( chapter => t.is( chapter, 700 ) )
);
test( "get last chapter for number in name", t =>
  i.getLastChapter( "07-Ghost", "mangalife" )
    .then( chapter => t.is( chapter, 100 ) )
);

// i.getLastPage
test( "get last page for url", t =>
  i.getLastPage( "https://mangalife.us/read-online/Platinum-End-chapter-30-page-1.html", "mangalife" )
    .then( page => t.is( page, 44 ) )
);
