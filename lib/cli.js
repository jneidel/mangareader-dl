const execTimer = require( "execution-time" );
const range = require( "py-range" );
const pMap = require( "p-map" );
const progress = require( "cli-progress" );
const chalk = require( "chalk" );

const i = require( "." );

const dots = // Source: https://github.com/sindresorhus/cli-spinners
  [ "⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏" ];

/**
 * @async
 * @param {string} siteUrl
 * @param {*buffer[]} buffers - Pointer to array of buffers
 * @returns Page buffer added to buffers array
 */
async function downloadPage( { siteUrl, buffers } ) {
  const manga = await i.createManga( siteUrl );

  const img = await i.downloadImg( manga.imgSrc, manga.name );
  buffers.push( { n: manga.page, buff: img } );
}

/**
 * Run download process starting from given manga
 * @async
 * @param {object} manga
 */
async function downloadChapters( manga ) {
  const maxPages = await i.getLastPage( manga.siteUrl );
  const buffers = [];
  let done = false;
  let lastBuffers = [];
  let noChangeIn = 0;

  function sortBuffers( buffers ) {
    return buffers.sort( ( a, b ) => a.n - b.n );
  }

  const timer = execTimer();
  timer.start();

  const bar = new progress.Bar( {
    format: `${chalk.green( "{spinner}" )} ${manga.name} ${chalk.green( manga.chapter )} [{bar}] {prepercentage}${chalk.green( "{percentage}%" )} | page ${chalk.green( "{value}/{total}" )} | chapter ${chalk.green( `${manga.chapter}/${manga.max}` )} {downloadtime}`,
  }, progress.Presets.shades_grey );

  bar.start( maxPages, 0, {
    downloadtime : "",
    spinner      : dots[0],
    prepercentage: " ", // Align percentage with 100% from chapter above
  } );

  let dotsFrame = 0;
  function updateBar() {
    setTimeout( () => {
      dotsFrame = dotsFrame < dots.length - 1 ? dotsFrame + 1 : 0;

      if ( buffers.length === lastBuffers ) {
        noChangeIn += 80;
      } else {
        bar.update( buffers.length, {
          spinner: dots[dotsFrame],
        } );

        lastBuffers = buffers.length;
        noChangeIn = 0;
      }

      console.log( "updatin", noChangeIn, buffers.length, lastBuffers );

      if ( !done ) return updateBar();
      if ( noChangeIn >= 2000 ) {
        for ( const k of range( 1, maxPages + 1 ) ) {
          let found = false;

          buffers.forEach( x => {
            if ( x.n === k ) {
              found = true;
            }
          } );

          if ( !found ) {
            console.log( k, " not found...reloading" );
            downloadPage( {
              siteUrl: i.createSiteUrl( manga.name, manga.chapter, k ),
              buffers,
            } );
          }
        }
      }
    }, 80 );
  }
  updateBar();

  const pagesToBeDownloaded = range( 1, maxPages + 1 )
    .map( page => {
      return {
        siteUrl: i.createSiteUrl( manga.name, manga.chapter, page ),
        buffers,
      };
    } );

  await pMap( pagesToBeDownloaded, downloadPage, { concurrency: 4 } );

  done = true;
  const time = timer.stop();

  bar.update( maxPages, {
    downloadtime : `| finished in ${( time.time / 1000 ).toFixed( 0 )}s`,
    spinner      : "❯",
    prepercentage: "",
  } );
  bar.stop();

  sortBuffers( buffers );
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
