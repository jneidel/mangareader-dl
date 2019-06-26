const fs = require( "mz/fs" );
const path = require( "path" );

/**
 * Reset test settings.json
 * @returns settingsPath
 */
module.exports = () => {
  const settingsPath = path.resolve( __dirname, "mangareader-dl.json" );

  fs.writeFileSync( settingsPath, `{ "config": {}, "history": {} }` );

  return settingsPath;
};
