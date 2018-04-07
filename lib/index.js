const axios = require( "axios" );
const cheerio = require( "cheerio" );
const fs = require( "mz/fs" );
const path = require( "path" );
const Jszip = require( "jszip" );
const DotJson = require( "dot-json" );
const chalk = require( "chalk" );

/**
 * Includes general purpose functions,
 * implemented into the download process in download.js
 * @exports {object} - Object of functions
 */

const providerExtensions = {
  mangareader: "net",
  readmng    : "com",
};

/**
 * Parse image source url from given site
 * @async
 * @param {string} siteUrl
 * @returns {(string|Error)} - Returns img source url if not invalid page or chapter
 */
const getImgSrcIfValid = ( siteUrl, provider ) => axios.get( siteUrl )
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

/**
 * Parse data from given url
 * @param {string} url
 * @returns {object} - Incomplete manga object with name, chapter, page, provider
 */
function parseFromUrl( url ) {
  const [ , provider, name, chapter = 1, page = 1 ] =
    url.match( /(?:https?:\/\/)?(?:www.)?((?:mangareader.net)|(?:readmng.com))?(?:\/)?([^/]+)\/?(\d+)?\/?(\d+)?/i );
  // Matches https://www.mangareader.net/shingeki-no-kyojin/103/39 & https://www.readmng.com/platinum-end/19/2

  return {
    name,
    chapter : Number( chapter ),
    page    : Number( page ),
    provider: provider ? provider.split( "." )[0] : null,
  };
}

/**
 * Create url from given manga object
 * @param {string} provider
 * @param {string} name
 * @param {string} chapter
 * @param {string} page - Default 1, if page doesnt matter
 * @returns {string}
 */
const createSiteUrl = ( provider, name, chapter, page = 1 ) => {
  provider = `${provider}.${providerExtensions[provider]}`;

  return `https://www.${provider}/${name}/${chapter}/${page}`;
};

/**
 * Create manga object from given site
 * @async
 * @param {string} siteUrl
 * @returns {object} - Manga object containing name, chapter, page, siteUrl, imgSrc
 */
function createManga( siteUrl, outputPath ) {
  const manga = parseFromUrl( siteUrl );

  manga.chapter = manga.chapter || 1;
  manga.page = manga.page || 1;
  manga.outputPath = outputPath;
  manga.siteUrl = createSiteUrl( manga.provider, manga.name, manga.chapter, manga.page );

  return getImgSrcIfValid( siteUrl, manga.provider )
    .then( imgSrc => {
      manga.imgSrc = imgSrc;
      return manga;
    } );
}

/**
 * Chapter + 1, regenerate siteUrl, return newly created new manga object
 * @async
 * @param {object} manga
 * @returns {object} - Updated manga object
 */
function increase( manga ) {
  manga.chapter += 1;
  manga.page = 1;

  manga.siteUrl = createSiteUrl( manga.provider, manga.name, manga.chapter, manga.page );

  return getImgSrcIfValid( manga.siteUrl, manga.provider )
    .then( imgSrc => {
      manga.imgSrc = imgSrc;
      return manga.imgSrc instanceof Error ? null : manga;
    } );
}

/**
 * Downloads the given image and returns its buffer
 * @async
 * @param {string} imgSrc
 * @param {string} name
 * @returns {buffer} - Buffer of downloaded image
 */
const downloadImg = imgSrc => axios.get( imgSrc, { responseType: "arraybuffer" } )
  .then( res => res.data )
  .then( data => Buffer.from( data, "binary" ) )
  .catch( err => {
    console.log( `Connection Err, Img '${imgSrc}'` );
    return downloadImg( imgSrc );
  } );

/**
 * Create cbz file from an array of buffers representing the pages of the chapter
 * @async
 * @param {buffer[]} buffers
 * @param {string}   name
 * @param {string}   chapter
 * @returns {string} - Path of written cbz file
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

/**
 * @async
 * @param {string} name
 * @returns {number} - Last chapter
 */
const getLastChapter = ( name, provider ) => Promise.resolve( `http://www.${provider}.${providerExtensions[provider]}/${name}` )
  .then( url => axios.get( url ) )
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
    return getLastChapter( name, provider );
  } );

/**
 * @async
 * @param {string} siteUrl
 * @returns {number} - Last page
 */
const getLastPage = siteUrl => axios.get( siteUrl )
  .then( html => {
    const $ = cheerio.load( html.data );

    const { provider } = parseFromUrl( siteUrl );
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
    console.log( `Connection Err, Page '${siteUrl}'` );
    return getLastPage( siteUrl );
  } );

/**
 * Write given input to config file
 * @param {object} data
 * @param {string} data.outputPath - Default output path
 * @param {string} [configPath] - Path to config file
 */
function writeConfig( { outputPath } = {}, configPath = path.resolve( __dirname, "..", "mangareader-dl.config.json" ) ) {
  const config = new DotJson( configPath );

  if ( outputPath ) {
    config.set( "outputPath", outputPath ).save();
  }
}

/**
 * Write given date to history
 * @param {string} name
 * @param {number} chapter
 * @param {string} path - Download directory for given manga
 * @param {string} [historyPath] - Path to history file
 */
function writeHistory( { name, chapter, provider, path: outputPath }, historyPath = path.resolve( __dirname, "..", "mangareader-dl.history.json" ) ) {
  const history = new DotJson( historyPath );

  history
    .set( `${name}.chapter`, chapter )
    .set( `${name}.path`, outputPath )
    .set( `${name}.provider`, provider )
    .save();
}

/**
 * Read chapter, path for given name from history
 * @param {string} name
 * @param {string} [historyPath]
 * @returns {{ chapter: string, path: string }}
 */
function readHistory( name, historyPath = path.resolve( __dirname, "..", "mangareader-dl.history.json" ) ) {
  const history = new DotJson( historyPath );

  const chapter = history.get( `${name}.chapter` );
  const outputPath = history.get( `${name}.path` );
  const provider = history.get( `${name}.provider` );

  return { chapter, provider, path: outputPath };
}

/**
 * Prepend green prompt arrow to font of string
 * @param {string} str
 * @returns {string} - Prepended string
 */
const prependArrowPrintStdout = str => console.log( `${chalk.green( "❯" )} ${str}` );

/**
 * Output contents of ...history.json via 'list' command
 */
function outputHistory() {
  const historyPath = path.resolve( __dirname, "..", "mangareader-dl.history.json" );
  const history = new DotJson( historyPath );

  const mangaObj = history.get( "" );
  const mangas = Object.keys( mangaObj );

  if ( mangas.length > 0 ) {
    prependArrowPrintStdout( "Downloaded manga:" );
    mangas.forEach( manga => console.log( `  ${manga} - ${mangaObj[manga].chapter} [${mangaObj[manga].provider} - ${mangaObj[manga].path}]` ) );
  } else {
    prependArrowPrintStdout( `No manga downloaded yet. Specify --help for usage info.` );
  }
}

function clearHistory() {
  const historyPath = path.resolve( __dirname, "..", "mangareader-dl.history.json" );

  fs.writeFile( historyPath, "{}" );

  prependArrowPrintStdout( "History has been reset." );
}

module.exports = {
  getImgSrcIfValid,
  downloadImg,
  createSiteUrl,
  createManga,
  parseFromUrl,
  increase,
  createZip,
  getLastChapter,
  getLastPage,
  writeConfig,
  writeHistory,
  readHistory,
  outputHistory,
  prependArrowPrintStdout,
  clearHistory,
};
