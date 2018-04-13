const test = require( "ava" );
const path = require( "path" );
const fs = require( "mz/fs" );
const DotJson = require( "dot-json" );
const resetSettings = require( "./reset-settings.js" );

const s = require( "../lib/settings" );

// s.writeHistory
test.serial( "write manga to history [unit]", async t => {
  const settingsPath = resetSettings();
  const settings = new DotJson( settingsPath );

  settings
    .set( "history.shingeki-no-kyojin.chapter", "" )
    .set( "history.shingeki-no-kyojin.path", "" )
    .set( "history.shingeki-no-kyojin.provider", "" )
    .save();

  s.writeHistory( settings, {
    name    : "shingeki-no-kyojin",
    chapter : 103,
    provider: "mangareader",
    path    : "/Users/jneidel/code/mangareader-dl/test",
  } );

  const data = await fs.readFile( settingsPath, { encoding: "utf8" } );

  t.deepEqual( JSON.parse( data ), {
    config : {},
    history: {
      "shingeki-no-kyojin": {
        chapter : 103,
        provider: "mangareader",
        path    : "/Users/jneidel/code/mangareader-dl/test",
      },
    },
  } );
} );

// s.readHistoryForName
test.serial( "read manga history for given name [unit]", t => {
  const settingsPath = resetSettings();
  const settings = new DotJson( settingsPath );

  settings
    .set( "history.shingeki-no-kyojin.chapter", 102 )
    .set( "history.shingeki-no-kyojin.path", "/Users/jneidel/code/mangareader-dl/test" )
    .set( "history.shingeki-no-kyojin.provider", "mangareader" )
    .save();

  const { chapter, provider, path: mangaPath } = s.readHistoryForName( settings, "shingeki-no-kyojin" );

  t.is( chapter, 102 );
  t.is( mangaPath, "/Users/jneidel/code/mangareader-dl/test" );
  t.is( provider, "mangareader" );
} );

// s.parseDefaults
test.serial( "parse config from settings file [unit]", t => {
  const settingsPath = resetSettings();
  const settings = new DotJson( settingsPath );

  settings
    .set( "config.dir", true )
    .set( "config.provider", "mangareader" )
    .save();

  const defaults = s.parseDefaults( settings );

  t.deepEqual( defaults, {
    dir     : true,
    provider: "mangareader",
    out     : "./",
    extended: false,
  } );
} );
