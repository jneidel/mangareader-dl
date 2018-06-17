const range = require( "py-range" );
const promiseMap = require( "p-map" );
const log = require( "./log" );
const progressBar = require( "./progress-bar" );

const i = require( "." );
const s = require( "./settings" );

/**
 * Includes functions running the download process
 * @exports {function} downloadManga - Download the manga for the given url
 */

const spinner = // Source: https://github.com/sindresorhus/cli-spinners
  [ "⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏" ];

const globalState = { timer: {}, spinnerFrame: 0, pagesCurrent: 0 };

/**
 * Download given page url, adding it's buffer to buffers array
 * @returns Img buffer added to buffers array
 */
async function downloadPage( { url, buffers } ) {
  const manga = await i.createManga( url );

  await i.downloadImg( manga )
    .then( img => buffers.push( { n: manga.page, buff: img } ) )
    .catch( err => {
      console.log( "Connection err: downloadPage", err );
      return downloadPage( { url, buffers } );
    } );
}

/**
 * Generate list of pages to be consumed by downloadPage via promiseMap
 * @param {buffer[]} buffers - Array to accumulate buffers of downloaded imgs
 * @returns {object[]}
 * @returns {string}   .url     - Link to page in range "pagesTotal"
 * @returns {buffer[]} .buffers - Link to buffers on every object in array
 */
function genPagesToDownload( name, chapter, provider, pagesTotal, buffers ) {
  return range( 1, pagesTotal + 1 )
    .map( page => {
      return {
        url: i.createUrl( provider, name, chapter, page ),
        buffers,
      };
    } );
}

/**
 * Run download process starting with given manga object
 */
async function downloadChapters( manga, barMode, settings ) {
  manga.pagesTotal = await i.getLastPage( manga.url, manga.provider )
    .catch( err => {
      if ( manga.chapter < manga.chapterTotal )
        return 0;
      else
        return null;
    } );

  if ( manga.pagesTotal === null )
    return; // Exit downloadChapters

  const buffers = [];
  let lastBuffers = [];

  const bar = progressBar.page.setup( manga, barMode, globalState );
  const downloadTime = progressBar.timer.setup();

  let done = !manga.pagesTotal; // Default false, if no pages true

  /**
   * Update page progress bar every 80ms
   * Declared here for closure over 'done, bar, buffers'
   * @returns {function} - Recursive updateBar call
   */
  function updateBar( spinnerFrame, timeoutCounter ) {
    setTimeout( () => {
      spinnerFrame = spinnerFrame < spinner.length - 1 ? spinnerFrame + 1 : 0;

      if ( buffers.length === lastBuffers ) {
        timeoutCounter += 80;
      } else {
        lastBuffers = buffers.length;
        timeoutCounter = 0;
      }

      if ( !done ) {
        progressBar.page.update( bar, manga, spinner[spinnerFrame], buffers.length, barMode, globalState );
        return updateBar( spinnerFrame, timeoutCounter );
      }
    }, 80 );
  }
  updateBar( 0, 0 );

  const pagesToBeDownloaded = genPagesToDownload( manga.name, manga.chapter, manga.provider, manga.pagesTotal, buffers );

  await promiseMap( pagesToBeDownloaded, downloadPage, { concurrency: 4 } )
    .catch( err => console.log( err ) );

  done = true; // Stop bar.update running recursively via setTimeout

  progressBar.page.finish( bar, manga, downloadTime, barMode, globalState );

  await i.createZip( buffers, manga.name, manga.chapter, manga.outputPath );

  s.writeHistory( settings, { name: manga.name, chapter: manga.chapter, path: manga.outputPath, provider: manga.provider, subscribe: manga.subscribe } );

  const nextChapter = await i.increase( manga );
  if ( nextChapter ) {
    return downloadChapters( nextChapter, barMode, settings );
  } else {
    let invalid = true;
    while ( invalid && manga.chapter < manga.chapterTotal ) {
      const nextChapter = await i.increase( manga );
      if ( nextChapter ) {
        invalid = false;
        return downloadChapters( nextChapter, barMode, settings );
      } else
        manga.chapter++;
    }
  }

  process.on( "unhandledRejection", ( err ) => {
    console.log( "ECONNRESET::", err );
    throw new Error( manga.url );
  } );
}

/**
 * Create manga object, either newly or from historic data
 */
async function prepareDownload( url, { outputPath, provider, isForce, subscribe }, settings ) {
  log.prompt( `Preparing the download...` );

  if ( isForce ) { // Don't read history
    var manga = await i.createManga( url, outputPath, provider );
  } else { // Read history
    const { name } = i.parseFromUrl( url, provider );

    // Reassign path/provider from history
    const history = s.readHistoryForName( settings, name );
    provider = history.provider ? history.provider : provider;
    outputPath = history.path ? history.path : outputPath;

    var manga = await i.createManga( url, outputPath, provider );
    manga.chapter = history.chapter ? history.chapter + 1 : manga.chapter; // Reassign chapter from history
    manga.url = i.createUrl( manga.provider, manga.name, manga.chapter ); // Generate url with correct chapter
  }

  manga.chapterTotal = await i.getLastChapter( manga.name, manga.provider );
  if ( manga.chapter > manga.chapterTotal ) { // Historic chapters has been ++, check if valid
    log.prompt( `${manga.name} has no chapters available for download. (Latest: ${manga.chapter}). \n  If you want to overwrite the history and download with specified chapter/path use the --force flag.` );
    process.exit(); // eslint-disable-line unicorn/no-process-exit
  }

  manga.subscribe = subscribe;

  return manga;
}

/**
 * Download given manga
 */
async function downloadManga( url, options, settings ) {
  const manga = await prepareDownload( url, options, settings );

  if ( options.bar === "extended" ) { // --extended progress bar
    globalState.done = false;
    var bar = progressBar.chapter.setup( manga, globalState );
    progressBar.chapter.runUpdate( bar, 0, globalState );
  }

  await downloadChapters( manga, options.bar, settings )
    .catch( err => {
      console.log( err );
      downloadManga( err.message, options.bar, settings );
    } ); // Recover from ECONNRESET

  if ( options.bar === "extended" ) {
    progressBar.chapter.finish( bar, globalState );
  }
}

module.exports = {
  downloadManga,
  progressBar,
};
