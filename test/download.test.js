const test = require( "ava" );

const { progressBar } = require( "../lib/download.js" );

/**
 * String formatting tests
 */

// d.progressBar.lastTimePad & d.progressBar.allTimePad
test( "last: same last timer as all in s [unit]", t => t.is( progressBar.lastTimePad( 42, 42 ), "last: 42s" ) );
test( "all: same last timer as all in s [unit]", t => t.is( progressBar.allTimePad( 42 ), "all:  42s" ) );
/**
 * last: 42s
 * all:  42s
 */
test( "last: same last timer as all in m [unit]", t => t.is( progressBar.lastTimePad( 62, 62 ), "last: 1:03m" ) );
test( "all: same last timer as all in m [unit]", t => t.is( progressBar.allTimePad( 62 ), "all:  1:03m" ) );
/**
 * last: 1:02m
 * all:  1:02m
 */
test( "last: last in s, all in m [unit]", t => t.is( progressBar.lastTimePad( 42, 62 ), "last:   42s" ) );
test( "all: last in s, all in m  [unit]", t => t.is( progressBar.allTimePad( 62 ), "all:  1:03m" ) );
/**
 * last:   42s
 * all:  1:02m
*/
test( "last: last in s, all in 10+ m [unit]", t => t.is( progressBar.lastTimePad( 42, 930 ), "last:    42s" ) );
test( "all: last in s, all in 10+ m  [unit]", t => t.is( progressBar.allTimePad( 930 ), "all:  16:50m" ) );
/**
 * last:    42s
 * all:  15:50m
*/
test( "last: last in s, all in 100+ m [unit]", t => t.is( progressBar.lastTimePad( 42, 9000 ), "last:     42s" ) );
test( "all: last in s, all in 100+ m  [unit]", t => t.is( progressBar.allTimePad( 9000 ), "all:  150:00m" ) );
/**
 * last:     42s
 * all:  150:00m
 */
