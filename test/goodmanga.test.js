const test = require( "ava" );

const i = require( "../lib" );

// i.getImgSrcIfValid
test( "get image source", t =>
  i.getImgSrcIfValid( "http://www.goodmanga.net/dr.-stone/chapter/55/16", "goodmanga" )
    .then( src => t.is( src, "http://www.goodmanga.net/images/manga/dr.-stone/55/16.jpg" ) )
);
test( "get error for invalid page", t =>
  i.getImgSrcIfValid( "http://www.goodmanga.net/dr.-stone/chapter/55/20", "goodmanga" ) // Last page is 19
    .then( imgSrc => {
      t.truthy( imgSrc instanceof Error );
    } )
);

// i.createUrl
test( "create url with page [unit]", t =>
  t.is(
    i.createUrl( "goodmanga", "dr.-stone", 55, 16 ),
    "https://www.goodmanga.net/dr.-stone/chapter/55/16"
  )
);

// i.createManga
test( "create manga from url", t =>
  i.createManga( "https://www.goodmanga.net/dr.-stone/chapter/55", __dirname, "mangareader" )
    .then( data => {
      const testManga = {
        name      : "dr.-stone",
        chapter   : 55,
        page      : 1,
        provider  : "goodmanga",
        url       : "https://www.goodmanga.net/dr.-stone/chapter/55/1",
        imgSrc    : "http://www.goodmanga.net/images/manga/dr.-stone/55/1.jpg",
        outputPath: __dirname,
      };
      t.deepEqual( data, testManga );
    } )
);
test( "pass on invalid page error", t =>
  i.createManga( "https://www.goodmanga.net/dr.-stone/chapter/55/20", __dirname, "mangareader" )
    .then( data => data.imgSrc )
    .then( imgSrc => {
      t.truthy( imgSrc instanceof Error );
    } )
);
test( "pass on invalid chapter error", t =>
  i.createManga( "https://www.goodmanga.net/dr.-stone/chapter/555", __dirname, "mangareader" )
    .then( data => data.imgSrc )
    .then( imgSrc => {
      t.truthy( imgSrc instanceof Error );
    } )
);

// i.parseFromUrl
test( "parse full url [unit]", t =>
  t.deepEqual( i.parseFromUrl( "http://www.goodmanga.net/dr.-stone/chapter/55" ), {
    name    : "dr.-stone",
    chapter : 55,
    page    : 1,
    provider: "goodmanga",
  } )
);
test( "parse url without www.goodmanga.net [unit]", t =>
  t.deepEqual( i.parseFromUrl( "dr.-stone/chapter/55", "goodmanga" ), {
    name    : "dr.-stone",
    chapter : 55,
    page    : 1,
    provider: "goodmanga",
  } )
);
test( "parse url without site or /chapter [unit]", t =>
  t.deepEqual( i.parseFromUrl( "dr.-stone/chapter/55", "goodmanga" ), {
    name    : "dr.-stone",
    chapter : 55,
    page    : 1,
    provider: "goodmanga",
  } )
);

// i.getLastChapter
test( "get last chapter", t =>
  i.getLastChapter( "naruto", "goodmanga" )
    .then( chapter => t.is( chapter, 700 ) )
);
test( "get last chapter for number in name", t =>
  i.getLastChapter( "yu-gi-oh-5ds", "goodmanga" )
    .then( chapter => t.is( chapter, 9 ) )
);

// i.getLastPage
test( "get last page for url", t =>
  i.getLastPage( "http://www.goodmanga.net/dr.-stone/chapter/55", "goodmanga" )
    .then( page => t.is( page, 19 ) )
);
