const execTimer = require( "execution-time" );
const range = require( "py-range" );
const promiseMap = require( "p-map" );
const chalk = require( "chalk" );
const progress = require( "progress-string" );
const logUpdate = require( "log-update" );
const strpad = require( "strpad" );
const windowWidth = require( "window-size" ).width;

const i = require( "." );

/**
 * Includes functions running the download process
 * @exports {function} downloadManga - Download the manga for the given url
 */

const spinner = // Source: https://github.com/sindresorhus/cli-spinners
  [ "⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏" ];

/**
 * Download given page url, adding it's buffer to buffers array
 * @returns Img buffer added to buffers array
 */
async function downloadPage( { url, buffers } ) {
  const manga = await i.createManga( url );

  const img = await i.downloadImg( manga.imgSrc, manga.name );
  buffers.push( { n: manga.page, buff: img } );
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
   * @returns {number} - Result of timer in ms
   */
  finish( instance ) {
    const result = instance.stop();

    return result.time;
  },
};

const globalState = { timer: {} };
const progressBar = {
  /**
   * Building blocks of the printed progress bar
   */
  spinner    : frame => `${chalk.green( frame )}`, // Len 1
  percent0   : ( current, total ) => `${chalk.green( `${strpad.left( ( current / total * 100 ).toFixed( 0 ), 3 )}%` )}`, // Len 4
  percent1   : ( current, total ) => `${chalk.green( `${strpad.left( ( current / total * 100 ).toFixed( 1 ), 5 )}%` )}`, // Len 6
  chapterPad : ( chapter, name ) => `${strpad.center( ` ${chalk.green( strpad.left( chapter, 3 ) )} `, 10 + name.length )}`, // Len name.length
  pageProg   : ( current, total ) => `page ${chalk.green( `${strpad.left( current, total.toString().length )}/${total}` )}`, // Len total.toString().length * 2 + 1
  chProg     : ( current, total ) => `chapter ${chalk.green( `${current}/${total}` )}`, // Len current.length + total.length + 1
  pageProgPad: ( current, total ) => `page    ${chalk.green( `${strpad.left( current, 3 )}/${strpad.left( total, 3 )}` )}`,
  chProgPad  : ( current, total ) => `chapter ${chalk.green( `${strpad.left( current, 3 )}/${strpad.left( total, 3 )}` )}`, // Len 13
  lastTime   : last => `last in ${last / 60 >= 1 ? `${( last / 60 ).toFixed( 0 )}:` : ""}${last / 60 >= 1 ? strpad.left( ( last / 60 % 1 * 100 ).toFixed( 0 ), 2, "0" ) : last.toFixed( 0 )}${last / 60 >= 1 ? "m" : "s"}`,
  lastTimePad: ( last, all ) => `last: ${last / 60 >= 1 ? `${( last / 60 ).toFixed( 0 )}:` : all / 60 <= 1 ? "" : all / 60 <= 10 ? "  " : all / 60 <= 100 ? "   " : "    "}${last / 60 >= 1 ? strpad.left( ( last / 60 % 1 * 100 ).toFixed( 0 ), 2, "0" ) : last.toFixed( 0 )}${last / 60 >= 1 ? "m" : "s"}`,
  allTimePad : all => `all:  ${all / 60 >= 1 ? `${( all / 60 ).toFixed( 0 )}:` : ""}${all / 60 >= 1 ? strpad.left( ( all / 60 % 1 * 100 ).toFixed( 0 ), 2, "0" ) : all.toFixed( 0 )}${all / 60 <= 1 ? "s" : "m"}`, // All time relevant strings: Len 5 + ( last / 60 <= 1 ? 0 : last / 60 <= 10 ? 2 : last / 60 <= 100 ? 3 ) + ( last / 60 <= 1 ? last.toString().length : 2 )
  /**
   * Functions responsible for rendering the page progress bar
   * Exclusively called from withing downloadChapters
   */
  page       : {
    /**
     * Setup new page progress bar
     */
    setup( manga, isExt ) {
      if ( isExt ) return progressBar.page.setupExt( manga );

      const preBar = manga.name.length + 4 /* spaces + spinner */ + manga.chapter.toString().length;
      const percentage = 4; // Inc. padding
      const page = "page".length + 1 /* / */ + manga.pagesTotal.toString().length * 2; // Inc. padding
      const chapter = "chapter".length + 1 /* / */ + manga.chapter.toString().length + manga.chapterTotal.toString().length; // No padding
      const pastBar = percentage + page + chapter + 2 /* pipes */ + 7; // spaces
      const barLen = windowWidth - ( preBar + pastBar + 2 /* bar [] */ );

      return progress( { width: 60, total: manga.pagesTotal, incomplete: "░", complete: "█" } );
    },
    /**
     * Setup page process bar for --extended, not as return value but in the globalState object
     */
    setupExt( manga ) {
      globalState.bar = progress( { width: globalState.width, total: manga.pagesTotal, incomplete: "░", complete: "█" } );
      globalState.pagesTotal = manga.pagesTotal;
      globalState.chapter = manga.chapter;
      globalState.page = manga.page;

      return null;
    },
    /**
     * Update the given page progress bar
     */
    update( instance, manga, spinnerFrame, pagesCurrent, isExt = false ) {
      if ( isExt ) return progressBar.page.updateExt( spinnerFrame, pagesCurrent );

      const pb = progressBar;

      logUpdate( `${pb.spinner( spinnerFrame )} ${manga.name} ${chalk.green( manga.chapter )} [${instance( pagesCurrent )}] ${pb.percent0( pagesCurrent, manga.pagesTotal )} | ${pb.pageProg( pagesCurrent, manga.pagesTotal )} | ${pb.chProg( manga.chapter, manga.chapterTotal )}${globalState.timer.last ? ` | ${pb.lastTime( globalState.timer.last )}` : ""}` );
    },
    /**
     * Update page progress bar by updating the changed values in globalState
     */
    updateExt( spinnerFrame, pagesCurrent ) {
      globalState.spinnerFrame = spinnerFrame;
      globalState.pagesCurrent = pagesCurrent;
    },
    /**
     * Teardown page progress bar
     * @param {execTimer} downloadTimer - Instance of timer to be finished
     */
    finish( instance, manga, lastDownloadTimer, isExt ) {
      globalState.timer.last = timer.finish( lastDownloadTimer ) / 1000; // Used by both page & chapter

      if ( isExt ) return progressBar.page.finishExt();

      progressBar.page.update( instance, manga, "❯", manga.pagesTotal );
    },
    /**
     * Teardown for the --extended page progress bar, via globalState object
     */
    finishExt() {
      globalState.timer.add = true;
      globalState.spinnerFrame = "❯";
    },
  },
  /**
   * Functions responsible for rendering the chapter progress bar if --expanded is specified
   * Exclusively called from withing downloadManga
   */
  chapter: {
    /**
     * Initialize chapter progress bar, copy constants to globalState
     */
    setup( manga ) {
      const preBar = manga.name.length + 4 /* spaces + spinner */ + manga.chapter.toString().length;
      const percentage = 4; // Inc. padding
      // const page = "page".length + 1 /* / */ + manga.pagesTotal.toString().length * 2; // Inc. padding
      const chapter = "chapter".length + 1 /* / */ + manga.chapter.toString().length + manga.chapterTotal.toString().length; // No padding
      // const pastBar = percentage + page + chapter + 2 /* pipes */ + 7; // spaces
      // const barLen = windowWidth - ( preBar + pastBar + 2 /* bar [] */ );

      globalState.name = manga.name;
      globalState.chapterTotal = manga.chapterTotal;
      globalState.chapter = manga.chapter;
      globalState.width = 60;

      return progress( { width: globalState.width, total: manga.chapterTotal, incomplete: "░", complete: "█" } );
    },
    /**
     * Update page & chapter progress bar given the globalState
     */
    update( instance, spinnerFrame ) {
      const pb = progressBar;
      const gs = globalState;

      const pagesCurrent = gs.pagesCurrent;
      const pagesTotal = gs.pagesTotal;
      const chapterCurrent = gs.chapter;
      const chapterTotal = gs.chapterTotal;

      if ( gs.timer.add ) {
        gs.timer.all = gs.timer.all ? gs.timer.all + gs.timer.last : gs.timer.last;
        gs.timer.add = false;
      }

      if ( gs.bar )
        logUpdate( `${pb.spinner( gs.spinnerFrame )} ${gs.name} [${gs.bar( pagesCurrent )}] ${pb.percent1( pagesCurrent, pagesTotal )} | ${pb.pageProgPad( pagesCurrent, pagesTotal )}${gs.timer.last ? ` | ${pb.lastTimePad( gs.timer.last, gs.timer.all )}` : ""}
${pb.spinner( gs.done ? "❯" : spinner[spinnerFrame] )} ${pb.chapterPad( chapterCurrent, gs.name )} [${instance( chapterCurrent )}] ${pb.percent1( chapterCurrent, chapterTotal )} | ${pb.chProgPad( chapterCurrent, chapterTotal )}${gs.timer.all ? ` | ${pb.allTimePad( gs.timer.all )}` : ""}` );
    },
    /**
     * Wraps progressBar.chapter.update in a recursive setTimeout
     */
    runUpdate( instance, spinnerFrame = 0 ) {
      setTimeout( () => {
        spinnerFrame = spinnerFrame < spinner.length - 1 ? spinnerFrame + 1 : 0;

        progressBar.chapter.update( instance, spinnerFrame );

        if ( !globalState.done ) return progressBar.chapter.runUpdate( instance, spinnerFrame );
      }, 80 );
    },
    finish( instance ) {
      globalState.done = true;
      globalState.pagesCurrent = globalState.pagesTotal;
      globalState.finish = true;

      progressBar.chapter.update( instance, "❯" );
    },
  },
};

/**
 * Run download process starting with given manga object
 */
async function downloadChapters( manga, isExt ) {
  manga.pagesTotal = await i.getLastPage( manga.url, manga.provider );
  const buffers = [];
  let lastBuffers = [];

  const bar = progressBar.page.setup( manga, isExt );
  const downloadTime = timer.setup();

  let done = false;

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
        progressBar.page.update( bar, manga, spinner[spinnerFrame], buffers.length, isExt );
        return updateBar( spinnerFrame, timeoutCounter );
      }
    }, 80 );
  }
  updateBar( 0, 0 );

  const pagesToBeDownloaded = genPagesToDownload( manga.name, manga.chapter, manga.provider, manga.pagesTotal, buffers );

  await promiseMap( pagesToBeDownloaded, downloadPage, { concurrency: 4 } );

  done = true; // Stop bar.update running recursively via setTimeout

  progressBar.page.finish( bar, manga, downloadTime, isExt );

  await i.createZip( buffers, manga.name, manga.chapter, manga.outputPath );

  i.writeHistory( { name: manga.name, chapter: manga.chapter, path: manga.outputPath, provider: manga.provider } );

  const nextChapter = await i.increase( manga );
  if ( nextChapter ) {
    return downloadChapters( nextChapter, isExt );
  }

  process.on( "unhandledRejection", ( err ) => {
    console.log( "ECONNRESET::", err );
    throw new Error( manga.url );
  } );
}

/**
 * Create manga object, either newly or from historic data
 */
async function prepareDownload( url, outputPath, provider, isForce ) {
  logUpdate( `${chalk.green( "❯" )} Preparing the download...` );

  if ( isForce ) { // Don't read history
    var manga = await i.createManga( url, outputPath, provider );
  } else { // Read history
    const { name } = i.parseFromUrl( url, provider );
    const history = i.readHistory( name );

    outputPath = history.chapter ? history.path : outputPath; // Reassign path from history
    var manga = await i.createManga( url, outputPath, provider );
    manga.chapter = history.chapter ? history.chapter + 1 : manga.chapter; // Reassign chapter from history
    manga.url = i.createUrl( manga.provider, manga.name, manga.chapter ); // Generate url with correct chapter
  }

  manga.chapterTotal = await i.getLastChapter( manga.name, manga.provider );
  if ( manga.chapter > manga.chapterTotal ) { // Historic chapters has been ++, check if valid
    i.prependArrowPrintStdout( `${manga.name} has no chapters available for download. (Latest: ${manga.chapter}). \n  If you want to overwrite the history and download with specified chapter/path use the --force flag.` );
    process.exit(); // eslint-disable-line unicorn/no-process-exit
  }

  return manga;
}

/**
 * Download given manga
 */
async function downloadManga( url, outputPath, provider, isForce, isExt ) {
  const manga = await prepareDownload( url, outputPath, provider, isForce, isExt );

  if ( isExt ) { // --extended progress bar
    globalState.done = false;
    var bar = progressBar.chapter.setup( manga );
    progressBar.chapter.runUpdate( bar );
  }

  await downloadChapters( manga, isExt )
    .catch( err => {
      console.log( err );
      downloadManga( err.message, outputPath, provider, isForce, isExt );
    } ); // Recover from ECONNRESET

  if ( isExt ) {
    progressBar.chapter.finish( bar );
  }
}

module.exports = {
  downloadManga,
  progressBar,
};
