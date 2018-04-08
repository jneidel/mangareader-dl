const execTimer = require( "execution-time" );
const range = require( "py-range" );
const pMap = require( "p-map" );
const chalk = require( "chalk" );
const progress = require( "progress-string" );
const logUpdate = require( "log-update" );
const leftPad = require( "left-pad" );
const centerPad = require( "@fav/text.pad" );
const windowWidth = require( "window-size" ).width;

const i = require( "." );

/**
 * Includes functions around the download process
 * @exports {function} downloadManga - Download the manga in given url
 */

const dots = // Source: https://github.com/sindresorhus/cli-spinners
  [ "⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏" ];

/**
 * Process to download given url, adding the buffer to buffers array
 * @async
 * @param {string} siteUrl
 * @param {buffer[]} buffers - Pointer to array of buffers
 * @returns Page buffer added to buffers array
 */
async function downloadPage( { siteUrl, buffers } ) {
  const manga = await i.createManga( siteUrl );

  const img = await i.downloadImg( manga.imgSrc, manga.name );
  buffers.push( { n: manga.page, buff: img } );
}

/**
 * Generate list of pages to be consumed by promiseMap
 * @param {string} name
 * @param {number} chapter
 * @param {string} provider
 * @param {number} maxPages
 * @param {buffer[]} buffers
 * @returns {object[]}
 * @returns {string} .siteUrl   - Link to page in range "maxPages"
 * @returns {buffer[]} .buffers - Link to buffers on every object in array
 */
function genPagesToDownload( name, chapter, provider, maxPages, buffers ) {
  return range( 1, maxPages + 1 )
    .map( page => {
      return {
        siteUrl: i.createSiteUrl( provider, name, chapter, page ),
        buffers,
      };
    } );
}

const timer = {
  /**
   * Start timer
   * @returns {execTimer}
   */
  setup() {
    const tmr = execTimer();
    tmr.start();

    return tmr;
  },
  /**
   * Stop timer
   * @param {execTimer} instance
   * @returns {number} - Result of timer in ms
   */
  finish( instance ) {
    const result = instance.stop();

    return result.time;
  },
};

const globalState = {};

const progressBar = {
  /**
   * Setup a new progress bar
   * @param {object} manga - Manga object
   * @param {string} manga.name
   * @param {number} manga.chapter
   * @param {number} manga.max - Last chapter
   * @param {number} maxPages - Last page
   * @param {boolean} isExt - Whenever the --extended flag has been passed
   * @returns {Progress} - Setup progess bar
   */
  setup( manga, maxPages, isExt ) {
    if ( isExt ) return progressBar.setupExt( manga, maxPages );

    const preBar = manga.name.length + 4 /* spaces + spinner */ + manga.chapter.toString().length;
    const percentage = 4; // Inc. padding
    const page = "page".length + 1 /* / */ + maxPages.toString().length * 2; // Inc. padding
    const chapter = "chapter".length + 1 /* / */ + manga.chapter.toString().length + manga.max.toString().length; // No padding
    const pastBar = percentage + page + chapter + 2 /* pipes */ + 7; // spaces
    const barLen = windowWidth - ( preBar + pastBar + 2 /* bar [] */ );

    return progress( { width: barLen, total: maxPages, incomplete: "░", complete: "█" } );
  },
  /**
   * Setup extended process bar, not as return value but in the globalState object
   */
  setupExt( manga, maxPages ) {
    globalState.bar = progress( { width: globalState.width, total: maxPages, incomplete: "░", complete: "█" } );
    globalState.maxPages = maxPages;
    globalState.chapter = manga.chapter;
    globalState.page = manga.page;

    return null;
  },
  /**
   * Update the given progress bar
   * @param {progress} instance - Instance of progress
   * @param {number} downloaded - Number of downloaded pages
   */
  update( instance, manga, maxPages, spinnerFrame, downloaded, isExt ) {
    if ( isExt ) return progressBar.updateExt( spinnerFrame, downloaded );

    logUpdate( `${chalk.green( spinnerFrame )} ${manga.name} ${chalk.green( manga.chapter )} [${instance( downloaded )}] ${chalk.green( `${leftPad( ( downloaded / maxPages * 100 ).toFixed( 0 ), 3 )}%` )} | page ${chalk.green( `${leftPad( downloaded, maxPages.toString().length )}/${maxPages}` )} | chapter ${chalk.green( `${manga.chapter}/${manga.max}` )}` );

    //  | finished ${finishedIn}s
  },
  /**
   * Update progress bar by updating the changed values in globalState
   */
  updateExt( spinnerFrame, downloaded ) {
    globalState.spinnerFrame = spinnerFrame;
    globalState.downloaded = downloaded;
  },
  /**
   * Teardown progress bar
   * @param {execTimer} downloadTimer - Instance of timer to be finished
   * @param {boolean} isExt - Whenever the --extended flag has been passed
   */
  finish( instance, manga, maxPages, downloadTimer, isExt ) {
    if ( isExt ) return progressBar.finishExt( downloadTimer );

    const finishTime = timer.finish( downloadTimer );

    progressBar.update( instance, manga, maxPages, "❯", maxPages );
  },
  /**
   * Teardown for the extended progress bar, via globalState object
   */
  finishExt( downloadTimer ) {
    globalState.finishTime = timer.finish( downloadTimer );
    globalState.spinnerFrame = "❯";
  },
  /**
   * Initialize chapter progress bar, copy constants to globalState
   */
  initializeExt( manga ) {
    const preBar = manga.name.length + 4 /* spaces + spinner */ + manga.chapter.toString().length;
    const percentage = 4; // Inc. padding
    // const page = "page".length + 1 /* / */ + maxPages.toString().length * 2; // Inc. padding
    const chapter = "chapter".length + 1 /* / */ + manga.chapter.toString().length + manga.max.toString().length; // No padding
    // const pastBar = percentage + page + chapter + 2 /* pipes */ + 7; // spaces
    // const barLen = windowWidth - ( preBar + pastBar + 2 /* bar [] */ );

    globalState.name = manga.name;
    globalState.max = manga.max;
    globalState.chapter = manga.chapter;
    globalState.width = 60;

    return progress( { width: globalState.width, total: manga.max, incomplete: "░", complete: "█" } );
  },
  runExt( instance, spinnerFrame = 0 ) {
    setTimeout( () => {
      spinnerFrame = spinnerFrame < dots.length - 1 ? spinnerFrame + 1 : 0;

      const maxPages = globalState.maxPages;
      const downloaded = globalState.downloaded;
      const name = globalState.name;
      const chapter = globalState.chapter;
      const max = globalState.max;

      if ( !globalState.done && globalState.bar )
        logUpdate( `${chalk.green( globalState.spinnerFrame )} ${name} [${globalState.bar( downloaded )}] ${chalk.green( `${leftPad( ( downloaded / maxPages * 100 ).toFixed( 1 ), 5 )}%` )} | page    ${chalk.green( `${leftPad( downloaded, 3 )}/${leftPad( maxPages, 3 )}` )}
${chalk.green( dots[spinnerFrame] )} ${centerPad( ` ${chalk.green( leftPad( chapter, 3 ) )} `, 10 + name.length )} [${instance( chapter )}] ${chalk.green( `${leftPad( ( chapter / max * 100 ).toFixed( 1 ), 5 )}%` )} | chapter ${chalk.green( `${leftPad( chapter, 3 )}/${leftPad( max, 3 )}` )}` );

      if ( !globalState.done ) return progressBar.runExt( instance, spinnerFrame );
    }, 80 );
  },
};

/**
 * Run download process starting from given manga
 * @async
 * @param {object} manga
 * @param {boolean} isExt - Whenever the --extended flag has been passed
 */
async function downloadChapters( manga, isExt ) {
  const maxPages = await i.getLastPage( manga.siteUrl, manga.provider );
  const buffers = [];
  let lastBuffers = [];

  const bar = progressBar.setup( manga, maxPages, isExt );
  const downloadTime = timer.setup();

  let done = false;

  /**
   * Update bar every 80ms
   * Declared here for closure over 'done, bar, buffers'
   * @param {number} dotsFrame - Current frame of dots
   * @param {number} lastChange - Timeout counter
   * @returns {function} - Recursive updateBar call
   */
  function updateBar( dotsFrame, lastChange ) {
    setTimeout( () => {
      dotsFrame = dotsFrame < dots.length - 1 ? dotsFrame + 1 : 0;

      if ( buffers.length === lastBuffers ) {
        lastChange += 80;
      } else {
        lastBuffers = buffers.length;
        lastChange = 0;
      }

      if ( !done ) {
        progressBar.update( bar, manga, maxPages, dots[dotsFrame], buffers.length, isExt );
        return updateBar( dotsFrame, lastChange );
      }
    }, 80 );
  }
  updateBar( 0, 0 );

  const pagesToBeDownloaded = genPagesToDownload( manga.name, manga.chapter, manga.provider, maxPages, buffers );

  await pMap( pagesToBeDownloaded, downloadPage, { concurrency: 4 } );

  done = true; // Stop bar.update running recursively via setTimeout

  progressBar.finish( bar, manga, maxPages, downloadTime, isExt );

  await i.createZip( buffers, manga.name, manga.chapter, manga.outputPath );

  i.writeHistory( { name: manga.name, chapter: manga.chapter, path: manga.outputPath, provider: manga.provider } );

  const nextChapter = await i.increase( manga );
  if ( nextChapter ) {
    return downloadChapters( nextChapter, isExt );
  }

  process.on( "unhandledRejection", ( err ) => {
    console.log( "ECONNRESET::", err );
    throw new Error( manga.siteUrl );
  } );
}

/**
 * Download given manga
 * @async
 * @param {string} url - Mangareader.net url
 * @param {string} outputPath
 * @param {string} provider - Value of the --provider flag
 * @param {boolean} isForce - Whenever the --force flag has been passed
 * @param {boolean} isExt - Whenever the --min flag has been passed
 */
async function downloadManga( url, outputPath, provider, isForce, isExt ) {
  if ( isForce ) {
    var manga = await i.createManga( url, outputPath, provider );

    manga.max = await i.getLastChapter( manga.name, manga.provider );
  } else {
    const { name } = i.parseFromUrl( url, provider );
    const history = i.readHistory( name );

    outputPath = history.chapter ? history.path : outputPath; // Reassign path from history
    var manga = await i.createManga( url, outputPath, provider );
    manga.chapter = history.chapter ? history.chapter + 1 : manga.chapter; // Reassign chapter from history
    manga.siteUrl = i.createSiteUrl( manga.provider, manga.name, manga.chapter ); // SiteUrl with correct chapter

    manga.max = await i.getLastChapter( manga.name, manga.provider );

    if ( manga.chapter > manga.max ) { // From history chapter +1
      return i.prependArrowPrintStdout( `${name} has no more chapters available for download. (Latest: ${manga.chapter}). \n  If you want to overwrite the history and download with given chapter/path use the --force flag.` );
    }
  }

  if ( isExt ) {
    globalState.done = false;
    var bar = progressBar.initializeExt( manga );
    progressBar.runExt( bar );
  }

  await downloadChapters( manga, isExt )
    .catch( err => {
      console.log( err );
      downloadManga( err.message, outputPath, provider, isForce, isExt );
    } ); // Recover from ECONNRESET

  if ( isExt ) {
    globalState.done = true;
  }
}

module.exports = downloadManga;
