const cheerio = require( "cheerio" );
const pify = require( "pify" );
const cloudscraper = require( "cloudscraper" );

exports.getImgSrc = data => {
  const html = data[1];
  const $ = cheerio.load( html );

  return $( "#chapter_img" ).attr( "src" );
};

exports.getLastChapter = data => {
  const html = data[1];
  const $ = cheerio.load( html );

  return $( ".chp_lst" )[0].children[1].children[1].attribs.href.match( /www\.[^/]+\/[^/]+\/(\d+)/i )[1];
};

exports.getLastPage = data => {
  const html = data[1];
  const $ = cheerio.load( html );

  const dropdown = $( "select[name=category_type]" )[1].children;

  return dropdown[dropdown.length - 2].children[0].data;
};

exports.getImgBuffer = ( url, ajaxLib ) => {
  return pify( cloudscraper.request, { multiArgs: true } )( {
    method  : "GET",
    encoding: null,
    url,
  } )
    .then( res => res[1] )
    .then( data => Buffer.from( data, "binary" ) );
};
