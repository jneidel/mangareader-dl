const mangareader = require( "./mangareader" );
const readmng = require( "./readmng" );
const mangainn = require( "./mangainn" );
const mangalife = require( "./mangalife" );

exports.extensions = {
  mangareader: mangareader.extension,
  mangapanda : "com", // Reuses mangareader file, but not same extension
  readmng    : readmng.extension,
  mangainn   : mangainn.extension,
  mangalife  : mangalife.extension,
};

exports.getLib = provider =>
  provider === "mangareader" ? mangareader :
  provider === "mangalife" ? mangalife :
  provider === "mangainn" ? mangainn :
  provider === "readmng" ? readmng :
  provider === "mangapanda" ? mangareader :
  null; // Provider does not match
