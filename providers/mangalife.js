const cheerio = require( "cheerio" );
const axios = require( "axios" );

exports.extension = "us";

exports.parseUrl = function parseUrl( url ) {
  let result;
  if ( url.match( /\.html\/?$/i ) )
    result = url.match( /(?:read-online\/)(.+?(?=-chapter-))-chapter-(\d+)-page-(\d+)?.html/i );
    /* Matches:
     * Platinum-End-chapter-31-page-1.html
     */
  else if ( url.match( /^manga/i ) )
    result = url.match( /(?:manga\/)([^/]+)/ );
    /* Matches:
     * manga/kemono-jihen
     */
  else
    result = url.match( /([^/]+)\/?(\d+)?\/?(\d+)?/ );
    /* Matches:
     * kemono-jihen/12
     */

  const [ , name, chapter = 1, page = 1 ] = result;

  return { name, chapter, page };
};

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

