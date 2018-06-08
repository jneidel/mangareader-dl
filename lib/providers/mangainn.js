const cheerio = require( "cheerio" );
const axios = require( "axios" );

exports.ajax = axios.get;

exports.getImgSrc = html => {
  const $ = cheerio.load( html.data );

  if ( $( "#chapter_img" )[0] )
    return $( "#chapter_img" )[0].attribs.src;
  else {
    return $( ".img-responsive" )[0].attribs.src;
  }
};

exports.getLastChapter = html => {
  const $ = cheerio.load( html.data );

  const lastChapterUrl = $( "#chapter_list" )[0].children[3].children[1].children[1].attribs.href;
  const [ , chapter ] = lastChapterUrl.match( /(?:https?:\/\/)?(?:www.)?(?:mangainn.net)?(?:\/)?(?:[^/]+)\/?(\d+)?\/?/i );

  return chapter;
};

exports.getLastPage = html => {
  const $ = cheerio.load( html.data );

  return Math.floor( $( ".selectPage" )[0].children[1].children.length / 2 );
};

exports.getImgBuffer = require( "./mangareader" ).getImgBuffer;
