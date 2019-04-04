import test from "ava" ;

import * as i from "../dist/lib" ;

// I.getImgSrcIfValid
test( "get image source", t =>
  i.getImgSrcIfValid( "https://www.mangainn.net/ao-no-exorcist/100/35", "mangainn" )
    .then( src => t.is( src, "http://funmanga.com/uploads/chapters/527/121/34.jpg" ) )
);
test( "get error for invalid page", t =>
  i.getImgSrcIfValid( "https://www.mangainn.net/ao-no-exorcist/100/36", "mangainn" ) // Last page is 35
    .then( imgSrc => {
      t.truthy( imgSrc instanceof Error );
    } )
);

// I.createUrl
test( "create url with page [unit]", t =>
  t.is(
    i.createUrl( "mangainn", "ao-no-exorcist", 100, 33 ),
    "https://www.mangainn.net/ao-no-exorcist/100/33"
  )
);

// I.createManga
test( "create manga from url", t =>
  Promise.resolve( i.createManga( "https://www.mangainn.net/ao-no-exorcist/100", __dirname, "mangainn" ) )
    .then( data => {
      const testManga = {
        name      : "ao-no-exorcist",
        chapter   : 100,
        page      : 1,
        provider  : "mangainn",
        url       : "https://www.mangainn.net/ao-no-exorcist/100/1",
        outputPath: __dirname,
        getImgSrc : i.getImgSrcIfValid,
      };
      t.deepEqual( data, testManga );
    } )
);
test( "pass on invalid page error", t =>
  Promise.resolve( i.createManga( "https://www.mangainn.net/ao-no-exorcist/100/999", __dirname, "mangainn" ) )
    .then( data => data.getImgSrc()
      .then( imgSrc => {
        t.truthy( imgSrc instanceof Error );
      } )
    )
);

// I.getLastChapter
test( "get last chapter", t =>
  i.getLastChapter( "naruto1", "mangainn" )
    .then( chapter => t.is( chapter, 700 ) )
);
test( "get last chapter for number in name", t =>
  i.getLastChapter( "jojo_s_bizarre_adventure_part_5_vento_aureo", "mangainn" )
    .then( chapter => t.is( chapter, 457 ) )
);

// I.getLastPage
test( "get last page for url", t =>
  i.getLastPage( "https://www.mangainn.net/ao-no-exorcist/100", "mangainn" )
    .then( page => t.is( page, 35 ) )
);
