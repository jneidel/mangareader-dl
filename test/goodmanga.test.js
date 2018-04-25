const test = require( "ava" );

const i = require( "../lib" );

// i.getImgSrcIfValid
test( "get gm image source", t =>
  i.getImgSrcIfValid( "http://www.goodmanga.net/dr.-stone/chapter/55/16", "goodmanga" )
    .then( src => t.is( src, "http://www.goodmanga.net/images/manga/dr.-stone/55/16.jpg" ) )
);
test( "get error for invalid gm page", t =>
  i.getImgSrcIfValid( "http://www.goodmanga.net/dr.-stone/chapter/55/20", "goodmanga" ) // Last page is 19
    .then( imgSrc => {
      t.truthy( imgSrc instanceof Error );
    } )
);

// i.createUrl
test( "create gm url with page [unit]", t =>
  t.is(
    i.createUrl( "goodmanga", "dr.-stone", 55, 16 ),
    "https://www.goodmanga.net/dr.-stone/chapter/55/16"
  )
);

// i.createManga

// i.parseFromUrl
test( "parse full gm url [unit]", t =>
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
test( "parse gm url without site or /chapter [unit]", t =>
  t.deepEqual( i.parseFromUrl( "dr.-stone/chapter/55", "goodmanga" ), {
    name    : "dr.-stone",
    chapter : 55,
    page    : 1,
    provider: "goodmanga",
  } )
);

// i.downloadImg

// i.getLastChapter
test( "get last chapter gm", t =>
  i.getLastChapter( "naruto", "goodmanga" )
    .then( chapter => t.is( chapter, 700 ) )
);

// i.getLastPage
test( "get last page for gm url", t =>
  i.getLastPage( "http://www.goodmanga.net/dr.-stone/chapter/55", "goodmanga" )
    .then( page => t.is( page, 19 ) )
);
