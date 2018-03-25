const axios = require( "axios" );
const cheerio = require( "cheerio" );
const fs = require( "mz/fs" );
const path = require( "path" );
const Jszip = require( "jszip" );

/**
 * Parse image source url from given site
 * @async
 * @param {string} siteUrl
 * @returns {(string|Error)} - Returns img source url if not invalid page or chapter
 */
const getImgSrc = siteUrl => axios.get( siteUrl )
  .then( html => {
    const $ = cheerio.load( html.data );

    const imgSrc = $( "#img" ).attr( "src" );

    return imgSrc || new Error( "chapter" ); // Invalid chapter
  } )
  .catch( err => new Error( "page" ) ); // Invalid page

/**
 * Create filename form given manga object
 * @param {object} manga
 * @returns {string}
 */
const createFilename = ( manga ) => `${manga.name}_${manga.chapter}_${manga.page}.jpg`;

/**
 * Parse data from given url
 * @param {string} url
 * @returns {object} - Incomplete manga object with name, chapter, page, siteUrl
 */
const parseFromUrl = ( url ) => {
  const [ , name, chapter, page ] = url.match( /(?:https?:\/\/)?www.mangareader.net\/(.+?)\/(\d+)\/?(\d+)?/i );
  // Matches https://www.mangareader.net/shingeki-no-kyojin/103/39

  return {
    name,
    chapter: Number( chapter ),
    page   : Number( page ) || 1,
    siteUrl: url,
  };
};

/**
 * Create manga object from given site
 * @async
 * @param {string} siteUrl
 * @returns {object} - Manga object containing name, chapter, page, siteUrl, filename, imgSrc
 */
const createManga = ( siteUrl ) => {
  const manga = parseFromUrl( siteUrl );

  manga.filename = createFilename( manga );

  return getImgSrc( siteUrl )
    .then( imgSrc => {
      manga.imgSrc = imgSrc;
      return manga;
    } );
};

/**
 * Create url from given manga object
 * @param {object} manga
 * @returns {string}
 */
const createSiteUrl = ( manga ) => `https://www.mangareader.net/${manga.name}/${manga.chapter}${manga.page > 1 ? `/${manga.page}` : ""}`;

/**
 * Page|Chapter + 1, regenerate siteUrl, return newly created new manga object
 * @async
 * @param {string} whatToIncrease - Either page or chapter
 * @param {object} manga
 * @returns {object}              - Manga object
 */
const increase = ( whatToIncrease, mangaObj ) => {
  const manga = JSON.parse( JSON.stringify( mangaObj ) ); // Copy to not change original object
  manga[whatToIncrease]++;

  const siteUrl = createSiteUrl( manga );

  return createManga( siteUrl )
    .then( manga => manga.imgSrc instanceof Error ? manga.imgSrc : manga );
};

/**
 * Downloads the given image and returns its buffer
 * @async
 * @param {string} imgSrc
 * @param {string} name
 * @returns {buffer} - Buffer of downloaded image
 */
const downloadImg = imgSrc => axios.get( imgSrc, { responseType: "arraybuffer" } )
  .then( res => res.data )
  .then( data => Buffer.from( data, "binary" ) );

/**
 * Create cbz file from an array of buffers representing the pages of the chapter
 * @async
 * @param {buffer[]} buffers
 * @param {string}   name
 * @param {string}   chapter
 * @returns {string} - Path of written cbz file
 */
const createZip = async ( buffers, name, chapter, outputPath = path.resolve( __dirname, `tmp/${name}-${chapter}.cbz` ) ) => {
  const zip = new Jszip();

  let i = 1;
  for ( const buffer of buffers ) {
    await zip.file( `${name}-${chapter}-${i}.jpg`, buffer, { binary: true } );
    i++;
  }

  return zip.generateAsync( { type: "uint8array" } )
    .then( data => fs.writeFile( outputPath, data, { encoding: null } )
      .then( () => outputPath )
      .catch( err => err ) );
};

exports.getImgSrc = getImgSrc;
exports.downloadImg = downloadImg;
exports.createFilename = createFilename;
exports.createSiteUrl = createSiteUrl;
exports.createManga = createManga;
exports.parseFromUrl = parseFromUrl;
exports.increase = increase;
exports.createZip = createZip;
