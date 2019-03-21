const cheerio = require( "cheerio" );
const axios = require( "axios" );

const utils = require( "./utils" );
const log = require( "../log" );

exports.extension = "net";

exports.parseUrl = function parseUrl( url ) {
  const [ , name, chapter = 1, page = 1 ] = url.match( /([^/]+)\/?(\d+)?\/?(\d+)?/ );
  /* Matches:
   * shingeki-no-kyojin/103/39
   */

  return { name, chapter, page };
};

exports.ajax = axios.get;

exports.getImgSrc = html => {
  const $ = cheerio.load( html.data );

  return $( "#img" ).attr( "src" );
};

exports.getLastChapter = ( html, numInName ) => {
  const $ = cheerio.load( html.data );

  const res = $( "#latestchapters" ).find( "a" )[0].children[0].data.match( /\s(\d+)/g );

  return numInName && res[1] ? res[1] : res[0];
};

exports.getLastPage = html => {
  const $ = cheerio.load( html.data );

  return $( "#selectpage" )[0].children[1].data.match( /(\d+)/ )[0];
};

const getImgBuffer = ( imgSrc ) => {
  let errorCounter = 0;

  const donwloadBuffer = url => axios.get( url, { responseType: "arraybuffer", timeout: 0 } )
    .then( res => res.data )
    .then( data => Buffer.from( data, "binary" ) )
    .catch( err => {
      errorCounter++;
      if ( errorCounter === 10 ) {
        if ( err.response )
          return utils.missingImage();
        else {
          log.error( `Error buffer downloading at ${url}`, { err } );
        }
      } else {
        return donwloadBuffer( url );
      }
    } );

  return donwloadBuffer( imgSrc );
};
exports.getImgBuffer = getImgBuffer;

