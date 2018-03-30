const axios = require( "axios" );
const cheerio = require( "cheerio" );
const fs = require( "mz/fs" );
const path = require( "path" );
const Jszip = require( "jszip" );
const DotJson = require( "dot-json" );

/**
 * Includes general purpose functions,
 * implemented into the download process in download.js
 * @exports {object} - Object of functions
 */

/**
 * Parse image source url from given site
 * @async
 * @param {string} siteUrl
 * @returns {(string|Error)} - Returns img source url if not invalid page or chapter
 */
const getImgSrcIfValid = siteUrl => axios.get( siteUrl )
  .then( html => {
    const $ = cheerio.load( html.data );

    const imgSrc = $( "#img" ).attr( "src" );

    return imgSrc || new Error( "chapter" ); // Invalid chapter
  } )
  .catch( err => new Error( "page" ) ); // Invalid page

/**
 * Parse data from given url
 * @param {string} url
 * @returns {object} - Incomplete manga object with name, chapter, page, siteUrl
 */
function parseFromUrl( url ) {
  const [ , name, chapter = 1, page = 1 ] = url.match( /(?:https?:\/\/)?(?:www.mangareader.net\/)?([^/]+)\/?(\d+)?\/?(\d+)?/i );
  // Matches https://www.mangareader.net/shingeki-no-kyojin/103/39

  return {
    name,
    chapter: Number( chapter ),
    page   : Number( page ),
    siteUrl: createSiteUrl( name, chapter, page ),
  };
}

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
  manga.siteUrl = createSiteUrl( manga.name, manga.chapter, manga.page );

  return getImgSrcIfValid( siteUrl )
    .then( imgSrc => {
      manga.imgSrc = imgSrc;
      return manga;
    } );
}

/**
 * Create url from given manga object
 * @param {string} name
 * @param {string} chapter
 * @param {string} page - Default 1, if page doesnt matter
 * @returns {string}
 */
const createSiteUrl = ( name, chapter, page = 1 ) => `https://www.mangareader.net/${name}/${chapter}/${page}`;

/**
 * Chapter + 1, regenerate siteUrl, return newly created new manga object
 * @async
 * @param {object} manga
 * @returns {object} - Updated manga object
 */
function increase( manga ) {
  manga.chapter += 1;
  manga.page = 1;

  manga.siteUrl = createSiteUrl( manga.name, manga.chapter, manga.page );

  return getImgSrcIfValid( manga.siteUrl )
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
    console.log( `Connection Err, Img ${imgSrc}` );
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
const getLastChapter = name => axios.get( `http://www.mangareader.net/${name}` )
  .then( html => {
    const $ = cheerio.load( html.data );

    let lastChapter = $( "#latestchapters" ).find( "a" )[0].children[0].data.match( /(\d+)/ )[0];
    lastChapter = Number( lastChapter );

    return lastChapter;
  } )
  .catch( err => {
    console.log( "Connection Err, Chapter", name );
    return getLastChapter( name );
  } );

/**
 * @async
 * @param {string} siteUrl
 * @returns {number} - Last page
 */
const getLastPage = siteUrl => axios.get( siteUrl )
  .then( html => {
    const $ = cheerio.load( html.data );

    let lastPage = $( "#selectpage" )[0].children[1].data.match( /(\d+)/ )[0];
    lastPage = Number( lastPage );

    return lastPage;
  } )
  .catch( err => {
    console.log( "Connection Err, Page", siteUrl );
    return getLastPage( siteUrl );
  } );

/**
 * Write given input to config file
 * @param {object} data
 * @param {string} data.outputPath - Default output path
 * @param {string} [configPath] - Path to config file
 */
function writeConfig(
  { outputPath } = {},
  configPath = path.resolve( __dirname, "..", "mangareader-dl.config.json" ) ) {
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
function writeHistory( { name, chapter, path }, historyPath = path.resolve( __dirname, "..", "mangareader-dl.config.json" ) ) {
  const history = new DotJson( historyPath );

  history.set( `${name}.chapter`, chapter ).save();
  history.set( `${name}.path`, path ).save();
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
  const mangaPath = history.get( `${name}.path` );

  return { chapter, path: mangaPath };
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
};
