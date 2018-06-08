const mangareader = require( "./mangareader" );
const readmng = require( "./readmng" );
const goodmanga = require( "./goodmanga" );
const mangahere = require( "./mangahere" );

exports.extensions = {
  mangareader: "net",
  readmng    : "com",
  goodmanga  : "net",
  mangapanda : "com",
  mangahere  : "cc",
};

exports.getLib = provider =>
  provider === "readmng" ? readmng :
  provider === "goodmanga" ? goodmanga :
  provider === "mangahere" ? mangahere :
  mangareader; // Both for mangareader & mangapanda
