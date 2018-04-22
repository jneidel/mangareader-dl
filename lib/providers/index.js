const mangareader = require( "./mangareader" );
const readmng = require( "./readmng" );
const goodmanga = require( "./goodmanga" );

exports.extensions = {
  mangareader: "net",
  readmng    : "com",
  goodmanga  : "net",
};

exports.getLib = provider =>
  provider === "readmng" ? readmng :
  provider === "goodmanga" ? goodmanga :
  mangareader;
