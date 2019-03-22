import test from "ava" ;
import * as fs from "mz/fs" ;
import DotJson from "dot-json" ;
import resetSettings from "./reset-settings" ;

import * as s from "../lib/settings" ;

// S.writeHistory
test.serial( "write manga to history [unit]", async t => {
  const settingsPath = resetSettings();
  const settings = new DotJson( settingsPath );

  settings
    .set( "history.shingeki-no-kyojin.chapter", "" )
    .set( "history.shingeki-no-kyojin.path", "" )
    .set( "history.shingeki-no-kyojin.provider", "" )
    .save();

  const historyData = {
    name    : "shingeki-no-kyojin",
    chapter : 103,
    provider: "mangareader",
    path    : "/Users/jneidel/code/mangareader-dl/test",
    subscribe: false,
  }
  s.writeHistory( settings, historyData );

  const data = await fs.readFile( settingsPath, { encoding: "utf8" } );

  t.deepEqual( JSON.parse( data ), {
    config : {},
    history: {
      "shingeki-no-kyojin": {
        chapter : 103,
        provider: "mangareader",
        path    : "/Users/jneidel/code/mangareader-dl/test",
        subscribe: false,
      },
    },
  } );
} );

// S.readHistoryForName
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

// S.parseDefaults
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
  } );
} );

