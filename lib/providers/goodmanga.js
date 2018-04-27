const cheerio = require( "cheerio" );

exports.getImgSrc = html => {
  const $ = cheerio.load( html.data );

  return $( "#manga_viewer" )[0].children[3].children[0].attribs.src;
};

exports.getLastChapter = html => {
  const $ = cheerio.load( html.data );

  const lastChapterUrl = $( "#chapters" )[0].children[3].children[1].children[1].attribs.href;
  const [ , , chapter ] = lastChapterUrl.match( /(?:https?:\/\/)?(?:www.)?(?:goodmanga.net)?(?:\/)?([^/]+)\/?(?:chapter\/)?(\d+)?\/?(\d+)?/i );

  return chapter;
};

exports.getLastPage = html => {
  const $ = cheerio.load( html.data );

  return $( "#manga_nav_top" )[0].children[3].children[5].children[0].data.match( /\d+/ )[0];
};

exports.getImgBuffer = require( "./mangareader" ).getImgBuffer;
