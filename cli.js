const execTimer = require( "execution-time" );
const range = require( "py-range" );
const pMap = require( "p-map" );
const progress = require( "cli-progress" );
const i = require( "." );

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
    format: "{name} {chapter} [{bar}] {percentage}% | page {value}/{total} | chapter {chapter}/103 {downloadtime}",
  }, progress.Presets.shades_grey );

  bar.start( maxPages, 0, {
    name        : manga.name,
    chapter     : manga.chapter,
    downloadtime: "",
  } );

  function updateBar() {
    setTimeout( () => {
      bar.update( buffers.length );

      if ( !done ) updateBar();
    }, 70 );
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
    downtime: `| finished in ${( time.time / 1000 ).toFixed( 0 )}s`,
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
