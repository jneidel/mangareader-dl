const axios = require( "axios" );
const cheerio = require( "cheerio" );
const fs = require( "mz/fs" );
const path = require( "path" );
const Jszip = require( "jszip" );
const chalk = require( "chalk" );
const util = require( "util" );
const cloudscraper = require( "cloudscraper" );
const cloudflareRequest = {
  get: util.promisify( cloudscraper.get ),
};

/**
 * Includes general purpose functions,
 * implemented into the download process in download.js
 */

const providerExtensions = {
  mangareader: "net",
  readmng    : "com",
};

/**
 * Set ajax library depending on site
 */
function handleAjaxLib( provider ) {
  let ajaxLib;

  switch ( provider ) {
    case "readmng":
      ajaxLib = cloudflareRequest;
      break;
    default:
      ajaxLib = axios;
  }

  return ajaxLib;
}

/**
 * Parse image source url from given site
 * @returns {(string|Error)} - Returns img source url if not invalid page or chapter
 */
const getImgSrcIfValid = ( url, provider, ajaxLib ) => {
  if ( !ajaxLib ) {
    ajaxLib = handleAjaxLib( provider );
    return getImgSrcIfValid( url, provider, ajaxLib );
  }

  return ajaxLib.get( url )
    .then( html => {
      const $ = cheerio.load( html.data );

      let imgSrc;
      switch ( provider ) {
        case "mangareader":
          imgSrc = $( "#img" ).attr( "src" );
          break;
        case "readmng":
          imgSrc = $( "#chapter_img" ).attr( "src" );
          break;
      }

      return imgSrc || new Error( "chapter" ); // Invalid chapter
    } )
    .catch( err => new Error( "page" ) ); // Invalid page
};

/**
 * Parse data from given url
 * @returns {object} - Incomplete manga object with name, chapter, page, provider
 */
function parseFromUrl( url, passedProvider = null ) {
  let [ , provider, name, chapter = 1, page = 1 ] =
    url.match( /(?:https?:\/\/)?(?:www.)?((?:mangareader.net)|(?:readmng.com))?(?:\/)?([^/]+)\/?(\d+)?\/?(\d+)?/i );
  // Matches https://www.mangareader.net/shingeki-no-kyojin/103/39 & https://www.readmng.com/platinum-end/19/2

  provider = provider ? provider.split( "." )[0] : null;
  provider = passedProvider && !provider ? passedProvider : provider;

  return {
    name,
    provider,
    chapter: Number( chapter ),
    page   : Number( page ),
  };
}

/**
 * Create url from given inputs
 */
const createUrl = ( provider, name, chapter, page = 1 ) => {
  provider = `${provider}.${providerExtensions[provider]}`;

  return `https://www.${provider}/${name}/${chapter}/${page}`;
};

/**
 * Create manga object from given url
 * @returns {object} - Manga object containing name, chapter, page, siteUrl, imgSrc, outputPath, provider
 */
function createManga( url, outputPath, provider ) {
  const manga = parseFromUrl( url, provider );

  manga.chapter = manga.chapter || 1;
  manga.page = manga.page || 1;
  manga.outputPath = outputPath;
  manga.url = createUrl( manga.provider, manga.name, manga.chapter, manga.page );

  return getImgSrcIfValid( url, manga.provider )
    .then( imgSrc => {
      manga.imgSrc = imgSrc;
      return manga;
    } );
}

/**
 * Chapter + 1, regenerate url, return newly created new manga object
 */
function increase( manga ) {
  manga.chapter += 1;
  manga.page = 1;

  manga.url = createUrl( manga.provider, manga.name, manga.chapter, manga.page );

  return getImgSrcIfValid( manga.url, manga.provider )
    .then( imgSrc => {
      manga.imgSrc = imgSrc;
      return manga.imgSrc instanceof Error ? null : manga;
    } );
}

/**
 * Downloads the given image and returns its buffer
 */
const downloadImg = ( imgSrc, provider, ajaxLib ) => {
  if ( !ajaxLib ) {
    ajaxLib = handleAjaxLib( provider );
    return downloadImg( imgSrc, provider, ajaxLib );
  }

  return ajaxLib.get( imgSrc, { responseType: "arraybuffer", timeout: 1000, encoding: null } )
    .then( res => res.data )
    .then( data => Buffer.from( data, "binary" ) )
    .catch( err => {
      console.log( `Connection Err, Img '${imgSrc}'` );
      return downloadImg( imgSrc, provider, ajaxLib );
    } );
};

/**
 * Create cbz file from an array of buffers representing the pages of the chapter
 * @param {buffer[]} buffers
 */
async function createZip( buffers, name, chapter, outputPath ) {
  const zip = new Jszip();

  buffers.sort( ( a, b ) => a.n - b.n );

  outputPath = path.resolve( outputPath, `${name}-${chapter}.cbz` );

  let i = 1;
  for ( const buffer of buffers ) {
    await zip.file( `${name}-${chapter}-${i}.jpg`, buffer.buff, { binary: true } );
    i++;
  }

  return zip.generateAsync( { type: "uint8array" } )
    .then( data => fs.writeFile( outputPath, data, { encoding: null } )
      .then( () => outputPath )
      .catch( err => err ) );
}

const getLastChapter = ( name, provider, ajaxLib ) => {
  if ( !ajaxLib ) {
    ajaxLib = handleAjaxLib( provider );
    return getLastChapter( name, provider, ajaxLib );
  }

  return Promise.resolve( `http://www.${provider}.${providerExtensions[provider]}/${name}` )
    .then( url => ajaxLib.get( url ) )
    .then( html => {
      const $ = cheerio.load( html.data );

      let lastChapter;
      switch ( provider ) {
        case "mangareader":
          lastChapter = $( "#latestchapters" ).find( "a" )[0].children[0].data.match( /(\d+)/ )[0];
          break;
        case "readmng":
          lastChapter = $( ".chp_lst" )[0].children[1].children[1].attribs.href.match( /www\.[^/]+\/[^/]+\/(\d+)/i )[1];
          break;
      }
      return Number( lastChapter );
    } )
    .catch( err => {
      console.log( "Connection Err, Chapter", name );
      console.log( err );
      return getLastChapter( name, provider, ajaxLib );
    } );
};

const getLastPage = ( url, provider, ajaxLib ) => {
  if ( !ajaxLib ) {
    ajaxLib = handleAjaxLib( provider );
    return getLastPage( url, provider, ajaxLib );
  }

  return ajaxLib.get( url )
    .then( html => {
      const $ = cheerio.load( html.data );

      const { provider } = parseFromUrl( url );
      let lastPage;

      switch ( provider ) {
        case "mangareader":
          lastPage = $( "#selectpage" )[0].children[1].data.match( /(\d+)/ )[0];
          break;
        case "readmng":
          const dropdown = $( "select[name=category_type]" )[1].children;
          lastPage = dropdown[dropdown.length - 2].children[0].data;
          break;
      }
      return Number( lastPage );
    } )
    .catch( err => {
      console.log( `Connection Err, Page '${url}'` );
      return getLastPage( url, provider, ajaxLib );
    } );
};

/**
 * Prepend green prompt arrow to font of string
 * @returns {string} - Prepended string
 */
const prependArrowPrintStdout = str => console.log( `${chalk.green( "❯" )} ${str}` );

module.exports = {
  getImgSrcIfValid,
  downloadImg,
  createUrl,
  createManga,
  parseFromUrl,
  increase,
  createZip,
  getLastChapter,
  getLastPage,
  prependArrowPrintStdout,
};
