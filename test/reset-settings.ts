import * as fs from "mz/fs" ;
import * as path from "path" ;

/**
 * Reset test settings.json
 * @returns settingsPath
 */
export default function resetSettings() {
  const settingsPath = path.resolve( __dirname, "mangareader-dl.json" );

  fs.writeFileSync( settingsPath, `{ "config": {}, "history": {} }` );

  return settingsPath;
};

