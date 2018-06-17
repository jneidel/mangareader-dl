const test = require( "ava" );

const progressBar = require( "../lib/progress-bar.js" );

// ARE NOT BEING EXPORTED ANYMORe

/**
 * String formatting tests
 */

// d.progressBar.lastTimePad & d.progressBar.allTimePad
test.skip( "last: same last timer as all in s [unit]", t => t.is( progressBar.lastTime( 42, 42 ), "last: 42s" ) );
test.skip( "all: same last timer as all in s [unit]", t => t.is( progressBar.allTime( 42 ), "all:  42s" ) );
/**
 * last: 42s
 * all:  42s
 */
test( "last: same last timer as all in m [unit]", t => t.is( progressBar.lastTime( 62, 62 ), "last: 1:02m" ) );
test( "all: same last timer as all in m [unit]", t => t.is( progressBar.allTime( 62 ), "all:  1:02m" ) );
/**
 * last: 1:02m
 * all:  1:02m
 */
test( "last: last in s, all in m [unit]", t => t.is( progressBar.lastTime( 42, 62 ), "last:   42s" ) );
test( "all: last in s, all in m  [unit]", t => t.is( progressBar.allTime( 62 ), "all:  1:02m" ) );
/**
 * last:   42s
 * all:  1:02m
*/
test( "last: last in s, all in 10+ m [unit]", t => t.is( progressBar.lastTime( 42, 930 ), "last:    42s" ) );
test( "all: last in s, all in 10+ m  [unit]", t => t.is( progressBar.allTime( 930 ), "all:  15:30m" ) );
/**
 * last:    42s
 * all:  15:50m
*/
test( "last: last in s, all in 100+ m [unit]", t => t.is( progressBar.lastTime( 42, 9000 ), "last:     42s" ) );
test( "all: last in s, all in 100+ m  [unit]", t => t.is( progressBar.allTime( 9000 ), "all:  150:00m" ) );
/**
 * last:     42s
 * all:  150:00m
 */
test( "last: last in single s, all in 1+ m [unit]", t => t.is( progressBar.lastTime( 4, 62 ), "last:    4s" ) );
test( "all: last in single s, all in 1+ m  [unit]", t => t.is( progressBar.allTime( 62 ), "all:  1:02m" ) );
/**
 * last:    4s
 * all:  1:02m
*/
test( "last: last in single s, all in 10+ m [unit]", t => t.is( progressBar.lastTime( 4, 930 ), "last:     4s" ) );
test( "all: last in single s, all in 10+ m  [unit]", t => t.is( progressBar.allTime( 930 ), "all:  15:30m" ) );
/**
 * last:     4s
 * all:  15:50m
*/
test( "last: last single s, all two s [unit]", t => t.is( progressBar.lastTime( 7, 14 ), "last:  7s" ) );
test( "all: last single s, all two s [unit]", t => t.is( progressBar.allTime( 14 ), "all:  14s" ) );
/**
 * last:  7s
 * all:  14s
 */
