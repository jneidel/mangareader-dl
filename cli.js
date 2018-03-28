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

  const timer = execTimer();
  timer.start();

  const bar = new progress.Bar( {
    format: `${chalk.green( "{spinner}" )} ${manga.name} ${chalk.green( manga.chapter )} [{bar}] ${chalk.green( "{percentage}%" )} | page ${chalk.green( "{value}/{total}" )} | chapter ${chalk.green( `${manga.chapter}/${manga.max}` )} {downloadtime}`,
  }, progress.Presets.shades_grey );

  bar.start( maxPages, 0, {
    downloadtime: "",
    spinner     : dots[0],
  } );

  let dotsFrame = 0;
  function updateBar() {
    setTimeout( () => {
      dotsFrame = dotsFrame < dots.length - 1 ? dotsFrame + 1 : 0;

      bar.update( buffers.length, {
        spinner: dots[dotsFrame],
      } );

      if ( !done ) updateBar();
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
    downloadtime: `| finished in ${( time.time / 1000 ).toFixed( 0 )}s`,
    spinner     : "❯",
  } );
  bar.stop();

  buffers.sort( ( a, b ) => a.n - b.n );
  await i.createZip( buffers, manga.name, manga.chapter );

  const nextChapter = await i.increase( manga );
  if ( nextChapter ) {
    return downloadChapters( nextChapter );
  }
}

module.exports = {
  downloadChapters,
};
