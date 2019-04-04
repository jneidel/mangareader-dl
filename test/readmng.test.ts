import test from "ava" ;
import * as fs from "mz/fs" ;
import * as path from "path" ;

import * as i from "../lib" ;

// I.getImgSrcIfValid
test( "get image source", t =>
  i.getImgSrcIfValid( "https://www.readmng.com/platinum-end/19/1", "readmng" )
    .then( src => t.is( src, "https://www.funmanga.com/uploads/chapters/15537/22/1.jpg?u=" ) )
);
test( "get error for invalid page", t =>
  i.getImgSrcIfValid( "https://www.readmng.com/platinum-end/19/41", "readmng" ) // Last page is 40
    .then( imgSrc => {
      t.truthy( imgSrc instanceof Error );
    } )
);
test( "get error for invalid chapter", t =>
  i.getImgSrcIfValid( "https://www.readmng.com/naruto/701/1", "readmng" ) // Last is 700
    .then( imgSrc => {
      t.truthy( imgSrc instanceof Error );
    } )
);

// I.createUrl
test( "create url with page [unit]", t =>
  t.is(
    i.createUrl( "readmng", "platinum-end", 19, 4 ),
    "https://www.readmng.com/platinum-end/19/4"
  )
);

// I.createManga
test( "create manga from url", t =>
  Promise.resolve( i.createManga( "https://www.readmng.com/platinum-end/19/1", __dirname, "readmng" ) )
    .then( data => t.deepEqual( data, {
      name      : "platinum-end",
      chapter   : 19,
      page      : 1,
      provider  : "readmng",
      url       : "https://www.readmng.com/platinum-end/19/1",
      outputPath: __dirname,
      getImgSrc : i.getImgSrcIfValid,
    } ) )
);
test( "pass on invalid page error", t =>
  Promise.resolve( i.createManga( "https://www.readmng.com/platinum-end/19/41", __dirname, "mangareader" ) )
    .then( data => data.getImgSrc()
      .then( imgSrc => {
        t.truthy( imgSrc instanceof Error );
      } )
    )
);
test( "pass on invalid chapter error", t =>
  Promise.resolve( i.createManga( "https://www.readmng.com/platinum-end/250/1", __dirname, "mangareader" ) )
    .then( data => data.getImgSrc()
      .then( imgSrc => {
        t.truthy( imgSrc instanceof Error );
      } )
    )
);

// I.increase
test( "increase chapter for valid url", t =>
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

const testBuffer = fs.readFileSync( path.resolve( __dirname, "buffers", "readmng.jpg" ) );

// I.downloadImg
test( "download image and return its buffer", t =>
  i.downloadImg( i.createManga( "https://www.readmng.com/shingeki-no-kyojin/104/9" ) )
    .then( buffer => t.is( Buffer.compare( buffer, testBuffer ), 0, "Buffers don't match" ) )
);

// I.getLastChapter
test( "get last chapter", t =>
  i.getLastChapter( "naruto", "readmng" )
    .then( chapter => t.is( chapter, 700 ) )
);
test( "get last chapter for number in name", t =>
  i.getLastChapter( "jojo_s_bizarre_adventure_part_5_vento_aureo", "readmng" )
    .then( chapter => t.is( chapter, 457 ) )
);

// I.getLastPage
test( "get last page for url", t =>
  i.getLastPage( "https://www.readmng.com/platinum-end/19/1", "readmng" )
    .then( page => t.is( page, 40 ) )
);
