const cheerio = require( "cheerio" );

exports.getImgSrc = html => {
  const $ = cheerio.load( html.data );

  return $( "#img" ).attr( "src" );
};

exports.getLastChapter = html => {
  const $ = cheerio.load( html.data );

  return $( "#latestchapters" ).find( "a" )[0].children[0].data.match( /\s(\d+)/ )[1];
};

exports.getLastPage = html => {
  const $ = cheerio.load( html.data );

  return $( "#selectpage" )[0].children[1].data.match( /(\d+)/ )[0];
};

exports.getImgBuffer = ( url, ajaxLib ) => {
  return ajaxLib( url, { responseType: "arraybuffer", timeout: 1000 } )
    .then( res => res.data )
    .then( data => Buffer.from( data, "binary" ) );
};
