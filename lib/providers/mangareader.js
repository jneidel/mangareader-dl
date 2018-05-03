const cheerio = require( "cheerio" );
const axios = require( "axios" );

exports.ajax = axios.get;

exports.getImgSrc = html => {
  const $ = cheerio.load( html.data );

  return $( "#img" ).attr( "src" );
};

exports.getLastChapter = html => {
  const $ = cheerio.load( html.data );

  return $( "#latestchapters" ).find( "a" )[0].children[0].data.match( /\s(\d+)/ )[1];
};

exports.getLastPage = html => {
  const $ = cheerio.load( html.data );

  return $( "#selectpage" )[0].children[1].data.match( /(\d+)/ )[0];
};

const getImgBuffer = url => {
  return axios.get( url, { responseType: "arraybuffer", timeout: 5000 } )
    .then( res => res.data )
    .then( data => Buffer.from( data, "binary" ) )
    .catch( err => getImgBuffer( url ) );
};
exports.getImgBuffer = getImgBuffer;
