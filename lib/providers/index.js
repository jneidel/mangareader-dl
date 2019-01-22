const mangareader = require( "./mangareader" );
const readmng = require( "./readmng" );
const goodmanga = require( "./goodmanga" );
const mangainn = require( "./mangainn" );
const mangalife = require( "./mangalife" );

exports.extensions = {
  mangareader: "net",
  readmng    : "com",
  goodmanga  : "net",
  mangapanda : "com",
  mangainn   : "net",
  mangalife  : "us",
};

exports.getLib = provider =>
  provider === "mangareader" ? mangareader :
  provider === "mangalife" ? mangalife :
  provider === "mangainn" ? mangainn :
  provider === "readmng" ? readmng :
  provider === "goodmanga" ? goodmanga :
  provider === "mangapanda" ? mangapanda :
  null; // Provider does not match
