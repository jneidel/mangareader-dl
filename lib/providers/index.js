const mangareader = require( "./mangareader" );
const readmng = require( "./readmng" );
const goodmanga = require( "./goodmanga" );
const mangainn = require( "./mangainn" );

exports.extensions = {
  mangareader: "net",
  readmng    : "com",
  goodmanga  : "net",
  mangapanda : "com",
  mangainn   : "net",
};

exports.getLib = provider =>
  provider === "readmng" ? readmng :
  provider === "goodmanga" ? goodmanga :
  provider === "mangainn" ? mangainn :
  mangareader; // Both for mangareader & mangapanda
