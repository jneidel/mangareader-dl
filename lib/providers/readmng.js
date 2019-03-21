const cheerio = require( "cheerio" );
const pify = require( "pify" );
const cloudscraper = require( "cloudscraper" );
const log = require( "../log" );

exports.extension = "com";

const ajax = pify( cloudscraper.get, { multiArgs: true } );
exports.ajax = ajax;

exports.getImgSrc = data => {
  const html = data[1];
  const $ = cheerio.load( html );

  return $( "#chapter_img" ).attr( "src" );
};

exports.getLastChapter = data => {
  const html = data[1];
  const $ = cheerio.load( html );

  if ( $( ".chp_lst" )[0] === undefined || $( ".chp_lst" )[0].children.length < 2 ) {
    log.prompt( `The manga doesn't exist/doesn't have chapters on 'readmng'` );
    process.exit(); // eslint-disable-line unicorn/no-process-exit
  }

  return $( ".chp_lst" )[0].children[1].children[1].attribs.href.match( /www\.[^/]+\/[^/]+\/(\d+)/i )[1];
};

exports.getLastPage = data => {
  const html = data[1];
  const $ = cheerio.load( html );

  const dropdown = $( "select[name=category_type]" )[1].children;

  return dropdown[dropdown.length - 2].children[0].data;
};

exports.getImgBuffer = imgSrc => {
  return pify( cloudscraper.request, { multiArgs: true } )( {
    method  : "GET",
    encoding: null,
    url     : imgSrc,
  } )
    .then( res => res[1] )
    .then( data => Buffer.from( data, "binary" ) );
};

exports.parseUrl = require( "./mangareader.js" ).parseUrl;
