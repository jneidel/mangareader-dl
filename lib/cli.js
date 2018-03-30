const execTimer = require( "execution-time" );
const range = require( "py-range" );
const pMap = require( "p-map" );
const Progress = require( "cli-progress" );
const chalk = require( "chalk" );

const i = require( "." );

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
 * @param {number} maxPages
 * @param {buffer[]} buffers
 * @returns {object[]}
 * @returns {string} .siteUrl   - Link to page in range "maxPages"
 * @returns {buffer[]} .buffers - Link to buffers on every object in array
 */
function genPagesToDownload( name, chapter, maxPages, buffers ) {
  return range( 1, maxPages + 1 )
    .map( page => {
      return {
        siteUrl: i.createSiteUrl( name, chapter, page ),
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
   * @returns {Progress} - Setup progess bar
   */
  setup( manga, maxPages ) {
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
   * Teardown progress bar
   * @param {Progress} instance
   * @param {number} maxPages
   * @param {execTimer} downloadTimer - Instance of timer to be finished
   */
  finish( instance, maxPages, downloadTimer ) {
    const finishTime = timer.finish( downloadTimer );

    instance.update( maxPages, {
      downloadtime : `| finished in ${( finishTime / 1000 ).toFixed( 0 )}s`,
      spinner      : "❯",
      prepercentage: "",
    } );
    instance.stop();
  },
};

/**
 * Run download process starting from given manga
 * @async
 * @param {object} manga
 */
async function downloadChapters( manga ) {
  const maxPages = await i.getLastPage( manga.siteUrl );
  const buffers = [];
  let lastBuffers = [];

  const bar = progressBar.setup( manga, maxPages );
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

  const pagesToBeDownloaded = genPagesToDownload( manga.name, manga.chapter, maxPages, buffers );

  await pMap( pagesToBeDownloaded, downloadPage, { concurrency: 4 } );

  done = true; // Stop bar.update running recursively via setTimeout

  progressBar.finish( bar, maxPages, downloadTime );

  await i.createZip( buffers, manga.name, manga.chapter, manga.outputPath );

  const nextChapter = await i.increase( manga );
  if ( nextChapter ) {
    return downloadChapters( nextChapter );
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
 */
async function downloadManga( url, outputPath ) {
  const manga = await i.createManga( url, outputPath );
  manga.max = await i.getLastChapter( manga.name );

  await downloadChapters( manga )
    .catch( err => downloadManga( err.message, outputPath ) ); // Recover from ECONNRESET
}

module.exports = downloadManga;
