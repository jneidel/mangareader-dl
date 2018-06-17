const execTimer = require( "execution-time" );
const progress = require( "progress-string" );
const chalk = require( "chalk" );
const strpad = require( "strpad" );
const log = require( "./log" );

const spinner = // Source: https://github.com/sindresorhus/cli-spinners
  [ "⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏" ];

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

const progressBar = {
  /**
   * Building blocks of the printed progress bar
   */
  spinner    : frame => `${chalk.green( frame )}`, // Len 1
  percent0   : ( current, total ) => `${chalk.green( `${strpad.left( ( current / total * 100 ).toFixed( 0 ), 3 )}%` )}`, // Len 4
  percent1   : ( current, total ) => `${chalk.green( `${strpad.left( ( current / total * 100 ).toFixed( 1 ), 5 )}%` )}`, // Len 6
  chapterPad : ( chapter, name ) => `${strpad.center( `${chalk.green( strpad.left( chapter, 3 ) )}`, 10 + name.length )}`, // Len name.length
  pageProg   : ( current, total ) => `page ${chalk.green( `${strpad.left( current, total.toString().length )}/${total}` )}`, // Len total.toString().length * 2 + 1
  chProg     : ( current, total ) => `chapter ${chalk.green( `${current}/${total}` )}`, // Len current.length + total.length + 1
  pageProgPad: ( current, total ) => `page    ${chalk.green( `${strpad.left( current, 3 )}/${strpad.left( total, 3 )}` )}`,
  chProgPad  : ( current, total ) => `chapter ${chalk.green( `${strpad.left( current, 3 )}/${strpad.left( total, 3 )}` )}`, // Len 13
  lastTime   : last => `last in ${last / 60 >= 1 ? `${Math.floor( last / 60 )}:` : ""}${last / 60 >= 1 ? strpad.left( ( last / 60 % 1 * 100 ).toFixed( 0 ), 2, "0" ) : Math.floor( last )}${last / 60 >= 1 ? "m" : "s"}`,
  lastTimePad: ( last, all ) => `last: ${last / 60 >= 1 ? `${Math.floor( last / 60 )}:` : all / 60 <= 1 ? "" : all / 60 <= 10 ? last < 10 ? "   " : "  " : all / 60 <= 100 && last > 10 ? "   " : "    "}${last / 60 >= 1 ? strpad.left( Math.floor( last / 60 % 1 * 60 ), 2, "0" ) : all < 60 && all > 10 && last < 10 ? strpad.left( Math.floor( last ), 2 ) : Math.floor( last )}${last / 60 >= 1 ? "m" : "s"}`,
  allTimePad : all => `all:  ${all / 60 >= 1 ? `${Math.floor( all / 60 )}:` : ""}${all / 60 >= 1 ? strpad.left( Math.floor( all / 60 % 1 * 60 ), 2, "0" ) : Math.floor( all )}${all / 60 <= 1 ? "s" : "m"}`, // All time relevant strings: Len 5 + ( last / 60 <= 1 ? 0 : last / 60 <= 10 ? 2 : last / 60 <= 100 ? 3 ) + ( last / 60 <= 1 ? last.toString().length : 2 )
  etaCalc    : ( gs ) => {
    const last = gs.timer.last;
    const all = gs.timer.all;

    const passedChapters = gs.chapter - gs.chapterStart ? gs.chapter - gs.chapterStart : 1;
    const openChapters = gs.chapterTotal - gs.chapter ? gs.chapterTotal - gs.chapter : 1;

    const estimateLast = last;
    const estimateAll = all / passedChapters;

    const weight = { last: 2, all: 8, total: 10 }; // 80/20

    const estimateAvg = ( estimateLast * weight.last + estimateAll * weight.all ) / weight.total;

    const eta = openChapters * estimateAvg;

    return eta;
  },
  etaDesc: ( eta ) => "eta",
  etaTime: ( eta ) => `${Math.floor( eta / 60 >= 1 ? eta / 60 : eta )}${eta / 60 >= 1 ? "m" : "s"}`,
  /**
   * Functions responsible for rendering the page progress bar
   * Exclusively called from withing downloadChapters
   */
  page   : {
    /**
     * Setup new page progress bar, not as return value but in the globalState object
     */
    setup( manga, barMode, gs ) {
      if ( barMode === "micro" ) return null; // Doesn't need instance, no bar is rendered

      gs.bar = progress( { width: gs.width, total: manga.pagesTotal, incomplete: "░", complete: "█" } );
      gs.pagesTotal = manga.pagesTotal;
      gs.chapter = manga.chapter;
      gs.page = manga.page;

      return null;
    },
    /**
     * Update the given page progress bar
     */
    update( instance, manga, spinnerFrame, pagesCurrent, barMode, gs ) {
      if ( barMode === "micro" ) {
        return log.update( `${progressBar.spinner( spinnerFrame )} ${manga.name} ${chalk.green( `${manga.chapter}/${manga.chapterTotal}` )} ${( pagesCurrent / manga.pagesTotal * 100 ).toFixed( 0 )}%` );
      }
      if ( barMode === "extended" ) {
        // Update page progress bar by updating the changed values in globalState
        gs.spinnerFrame = spinnerFrame;
        gs.pagesCurrent = pagesCurrent;
      }
    },
    /**
     * Teardown page progress bar
     * @param {execTimer} downloadTimer - Instance of timer to be finished
     */
    finish( instance, manga, lastDownloadTimer, barMode, gs ) {
      gs.timer.last = timer.finish( lastDownloadTimer ) / 1000; // Used by both page & chapter

      if ( barMode === "micro" ) {
        progressBar.page.updateMic( manga, manga.pagesTotal, "❯" );
      }
      if ( barMode === "extended" ) {
        gs.timer.add = true;
        gs.spinnerFrame = "❯";
        gs.pagesCurrent = gs.pagesTotal;
      }
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
    setup( manga, gs ) {
      gs.name = manga.name;
      gs.chapterTotal = manga.chapterTotal;
      gs.chapterStart = manga.chapter;
      gs.chapter = manga.chapter;
      gs.width = 60;

      return progress( { width: gs.width, total: manga.chapterTotal, incomplete: "░", complete: "█" } );
    },
    /**
     * Update page & chapter progress bar given the globalState
     */
    update( instance, spinnerFrame, gs ) {
      const pb = progressBar;

      const pagesCurrent = gs.pagesCurrent;
      const pagesTotal = gs.pagesTotal;
      const chapterCurrent = gs.chapter;
      const chapterTotal = gs.chapterTotal;

      if ( gs.timer.add ) {
        gs.timer.all = gs.timer.all ? gs.timer.all + gs.timer.last : gs.timer.last;
        gs.timer.add = false;
        gs.timer.eta = pb.etaCalc( gs );
      }

      if ( gs.bar )
        log.update( `${pb.spinner( gs.spinnerFrame )} ${gs.name} [${gs.bar( pagesCurrent )}] ${pb.percent1( pagesCurrent, pagesTotal )} | ${pb.pageProgPad( pagesCurrent, pagesTotal )}${gs.timer.last ? ` | ${pb.lastTimePad( gs.timer.last, gs.timer.all )} | ${pb.etaDesc( gs.timer.eta )}` : ""}
${pb.spinner( gs.done ? "❯" : spinner[spinnerFrame] )} ${pb.chapterPad( chapterCurrent, gs.name )} [${instance( chapterCurrent )}] ${pb.percent1( chapterCurrent, chapterTotal )} | ${pb.chProgPad( chapterCurrent, chapterTotal )}${gs.timer.all ? ` | ${pb.allTimePad( gs.timer.all )} | ${pb.etaTime( gs.timer.eta )}` : ""}` );
    },
    /**
     * Wraps progressBar.chapter.update in a recursive setTimeout
     */
    runUpdate( instance, spinnerFrame = 0, gs ) {
      setTimeout( () => {
        spinnerFrame = spinnerFrame < spinner.length - 1 ? spinnerFrame + 1 : 0;

        progressBar.chapter.update( instance, spinnerFrame, gs );

        if ( !gs.done ) return progressBar.chapter.runUpdate( instance, spinnerFrame, gs );
      }, 80 );
    },
    finish( instance, gs ) {
      gs.done = true;
      gs.pagesCurrent = gs.pagesTotal;
      gs.finish = true;

      progressBar.chapter.update( instance, "❯" );
    },
  },
  timer,
};

module.exports = progressBar;
