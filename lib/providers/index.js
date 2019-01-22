const mangareader = require( "./mangareader" );
const readmng = require( "./readmng" );
const mangainn = require( "./mangainn" );
const mangalife = require( "./mangalife" );

exports.extensions = {
  mangareader: "net",
  readmng    : "com",
  mangapanda : "com",
  mangainn   : "net",
  mangalife  : "us",
};

exports.getLib = provider =>
  provider === "mangareader" ? mangareader :
  provider === "mangalife" ? mangalife :
  provider === "mangainn" ? mangainn :
  provider === "readmng" ? readmng :
  provider === "mangapanda" ? mangapanda :
  null; // Provider does not match
