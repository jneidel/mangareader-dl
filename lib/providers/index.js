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
  provider === "readmng" ? readmng :
  provider === "goodmanga" ? goodmanga :
  provider === "mangainn" ? mangainn :
  provider === "mangalife" ? mangalife :
  mangareader; // Both for mangareader & mangapanda
