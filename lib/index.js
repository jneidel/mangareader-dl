const cheerio = require( "cheerio" );
const fs = require( "mz/fs" );
const path = require( "path" );
const Jszip = require( "jszip" );
const chalk = require( "chalk" );
const strpad = require( "strpad" );

/**
 * Includes general purpose functions,
 * implemented into the download process in download.js
 */

const providers = require( "./providers" );

const timeout = {
  counter: 10,
  msg    : "",
  /**
   * Increase counter, add msg, return whenever to continue or not
   */
  add( msg ) {
    if ( !this.counter ) {
      prependArrowPrintStdout( this.msg );
      process.exit(); // eslint-disable-line unicorn/no-process-exit
    }

    this.counter--;
    this.msg = msg;
  },
  /**
   * Reset counter after successful execution
   */
  reset() {
    this.counter = 10;
  },
};

/**
 * Parse image source url from given site
 * @returns {(string|Error)} - Returns img source url if not invalid page or chapter
 */
const getImgSrcIfValid = ( url, provider ) => {
  const providerLib = providers.getLib( provider );

  return providerLib.ajax( url )
    .then( data => {
      const imgSrc = providerLib.getImgSrc( data );

      return imgSrc || new Error( `Invalid: ${url}` );
    } )
    .catch( err => new Error( `Invalid: ${url}` ) );
};

/**
 * Parse data from given url
 * @returns {object} - Incomplete manga object with name, chapter, page, provider
 */
function parseFromUrl( url, passedProvider = null ) {
  let [ , provider, name, chapter = 1, page = 1 ] =
    String( url ).match( /(?:https?:\/\/)?(?:www.)?((?:mangareader.net)|(?:readmng.com)|(?:goodmanga.net))?(?:\/)?([^/]+)\/?(?:chapter\/)?(\d+)?\/?(\d+)?/i );
  /** Matches:
   * https://www.mangareader.net/shingeki-no-kyojin/103/39
   * https://www.readmng.com/platinum-end/19/2
   * http://www.goodmanga.net/dr.-stone/chapter/55
   */

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
  provider = `${provider}.${providers.extensions[provider]}`;

  return `https://www.${provider}/${name}/${provider === "goodmanga.net" ? "chapter/" : ""}${chapter}/${page}`;
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
const downloadImg = ( imgSrc, provider ) => {
  const providerLib = providers.getLib( provider );

  return providerLib.getImgBuffer( imgSrc )
    .then( buffer => { timeout.reset(); return buffer; } )
    .catch( err => {
      timeout.add( `Connection Error: Downloading image from the url '${imgSrc}'` );
      console.log( err );
      return downloadImg( imgSrc, provider );
    } );
};

/**
 * Create cbz file from an array of buffers representing the pages of the chapter
 * @param {buffer[]} buffers
 */
async function createZip( buffers, name, chapter, outputPath ) {
  const zip = new Jszip();

  buffers.sort( ( a, b ) => a.n - b.n );

  outputPath = path.resolve( outputPath, `${name}-${strpad.left( chapter, 3, 0 )}.cbz` );

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

function handle404( err, name, provider ) {
  if ( err.response.status === 404 )
    prependArrowPrintStdout( `The manga '${name}' doesn't exist/doesn't have chapters on '${provider}'` );
  process.exit(); // eslint-disable-line unicorn/no-process-exit
}

const getLastChapter = async ( name, provider ) => {
  const providerLib = providers.getLib( provider );

  let url = `http://www.${provider}.${providers.extensions[provider]}/${name}`;

  if ( provider === "goodmanga" )
    url = await providerLib.getNameUrl( name ).catch( err => handle404( err, name, provider ) );

  return Promise.resolve( url )
    .then( url => providerLib.ajax( url )
      .catch( err => handle404( err, name, provider ) )
    )
    .then( html => {
      const lastChapter = providerLib.getLastChapter( html );
      return Number( lastChapter );
    } )
    .then( chapter => { timeout.reset(); return chapter; } )
    .catch( err => {
      timeout.add( `Connection Error: Retrieving the last chapter from the url '${url}'` );
      return getLastChapter( name, provider );
    } );
};

const getLastPage = ( url, provider ) => {
  const providerLib = providers.getLib( provider );

  return providerLib.ajax( url )
    .then( html => {
      const providerLib = providers.getLib( provider );
      const lastPage = providerLib.getLastPage( html );
      return Number( lastPage );
    } )
    .then( page => { timeout.reset(); return page; } )
    .catch( err => {
      timeout.add( `Connection Error: Retrieving the last page from the url '${url}'` );
      return getLastPage( url, provider );
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
