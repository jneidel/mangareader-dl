const cheerio = require( "cheerio" );
const axios = require( "axios" );

exports.ajax = axios.get;

exports.getImgSrc = html => {
  const $ = cheerio.load( html.data );

  return $( ".CurImage" )[0].attribs.src;
};

exports.getLastChapter = html => {
  const $ = cheerio.load( html.data );

  const lastChapterUrl = $( ".chapter-list" )[0].children[1].attribs.href;

  const [ , chapter ] = lastChapterUrl.match( /-chapter-(\d+)/i );

  return chapter;
};

exports.getLastPage = html => {
  const $ = cheerio.load( html.data );

  return Math.floor( $( ".PageSelect" )[0].children.length );
};

exports.getImgBuffer = require( "./mangareader" ).getImgBuffer;

/**
 * Get the manga page (site/manga-name) for mangalife
 * Can't be generated as it has unique id in url (eg: goodmanga.net/17702/dr.-stone)
 */
exports.getNameUrl = name => `https://mangalife.us/manga/${name}`;

