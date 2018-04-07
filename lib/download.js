const execTimer = require( "execution-time" );
const range = require( "py-range" );
const pMap = require( "p-map" );
const Progress = require( "cli-progress" );
const chalk = require( "chalk" );

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

const progressBar = {
  /**
   * Setup a new progress bar
   * @param {object} manga - Manga object
   * @param {string} manga.name
   * @param {number} manga.chapter
   * @param {number} manga.max - Last chapter
   * @param {number} maxPages - Last page
   * @param {boolean} isMin - Whenever the --min flag has been passed
   * @returns {Progress} - Setup progess bar
   */
  setup( manga, maxPages, isMin ) {
    if ( isMin ) return progressBar.setupMin( manga, maxPages );

    const bar = new Progress.Bar( {
      format: `${chalk.green( "{spinner}" )} ${manga.name} ${chalk.green( manga.chapter )} [{bar}] {prepercentage}${chalk.green( "{percentage}%" )} | page ${chalk.green( "{value}/{total}" )} | chapter ${chalk.green( `${manga.chapter}/${manga.max}` )} {downloadtime}`,
    }, Progress.Presets.shades_grey );

    bar.start( maxPages, 0, {
      downloadtime : "",
      spinner      : dots[0],
      prepercentage: " ", // Align percentage with 100% from chapter above
    } );

    return bar;
  },
  /**
   * Setup minimal version of above progress bar
   * Param/return are the same
   */
  setupMin( manga, maxPages ) {
    const bar = new Progress.Bar( {
      format: `${chalk.green( "{spinner}" )} ${manga.name} ${chalk.green( manga.chapter )} [{bar}] p ${chalk.green( "{value}/{total}" )} | c ${chalk.green( `${manga.chapter}/${manga.max}` )}`,
    }, Progress.Presets.shades_grey );

    bar.start( maxPages, 0, {
      spinner: dots[0],
    } );

    return bar;
  },
  /**
   * Teardown progress bar
   * @param {Progress} instance
   * @param {number} maxPages
   * @param {execTimer} downloadTimer - Instance of timer to be finished
   * @param {boolean} isMin - Whenever the --min flag has been passed
   */
  finish( instance, maxPages, downloadTimer, isMin ) {
    if ( isMin ) return progressBar.finishMin( instance, maxPages, downloadTimer );

    const finishTime = timer.finish( downloadTimer );

    instance.update( maxPages, {
      downloadtime : `| finished in ${( finishTime / 1000 ).toFixed( 0 )}s`,
      spinner      : "❯",
      prepercentage: "",
    } );
    instance.stop();
  },
  /**
   * Teardown for the minimal progress bar
   * Param/return are the same
   */
  finishMin( instance, maxPages, downloadTimer ) {
    const finishTime = timer.finish( downloadTimer );

    instance.update( maxPages, {
      spinner: "❯",
    } );
    instance.stop();
  },
};

/**
 * Run download process starting from given manga
 * @async
 * @param {object} manga
 * @param {boolean} isMin - Whenever the --min flag has been passed
 */
async function downloadChapters( manga, isMin ) {
  const maxPages = await i.getLastPage( manga.siteUrl, manga.provider );
  const buffers = [];
  let lastBuffers = [];

  const bar = progressBar.setup( manga, maxPages, isMin );
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

      bar.update( buffers.length, {
        spinner: dots[dotsFrame],
      } );

      if ( buffers.length === lastBuffers ) {
        lastChange += 80;
      } else {
        lastBuffers = buffers.length;
        lastChange = 0;
      }

      if ( !done ) return updateBar( dotsFrame, lastChange );
    }, 80 );
  }
  updateBar( 0, 0 );

  const pagesToBeDownloaded = genPagesToDownload( manga.name, manga.chapter, manga.provider, maxPages, buffers );

  await pMap( pagesToBeDownloaded, downloadPage, { concurrency: 4 } );

  done = true; // Stop bar.update running recursively via setTimeout

  progressBar.finish( bar, maxPages, downloadTime, isMin );

  await i.createZip( buffers, manga.name, manga.chapter, manga.outputPath );

  i.writeHistory( { name: manga.name, chapter: manga.chapter, path: manga.outputPath, provider: manga.provider } );

  const nextChapter = await i.increase( manga );
  if ( nextChapter ) {
    return downloadChapters( nextChapter, isMin );
  }

  process.on( "unhandledRejection", ( err ) => {
    try {
      bar.update( buffers.length, {
        downloadtime: `| connection error, restarting...`,
        spinner     : "❯",
      } );
    } catch ( err2 ) {}

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
 * @param {boolean} isMin - Whenever the --min flag has been passed
 */
async function downloadManga( url, outputPath, provider, isForce, isMin ) {
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

  await downloadChapters( manga, isMin )
    .catch( err => {
      console.log( err );
      downloadManga( err.message, outputPath, provider, isForce, isMin );
    } ); // Recover from ECONNRESET
}

module.exports = downloadManga;
