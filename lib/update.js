const axios = require( "axios" );

/**
 * Contains functions for interacting with the api at api.jneidel.com for the 'update' command
 */

const api = "https://api.jneidel.com/mangareader";
// const api = "http://localhost:62220/mangareader"; // For local testing

// Utils
function handleResponseError( data ) {
  try {
    if ( data.meta.err ) {
      const err = data.meta.err;
      console.log( "API Error: ", err );
    } else {
      return data;
    }
  } catch ( err ) {
    console.log( "Server Error: ", err );
  }
}
function postToServer( url, payload = {} ) {
  return axios.post( url, payload )
    .then( response => response.data )
    .then( data => handleResponseError( data ) )
    .catch( err => handleResponseError( err.response.data ) );
}

// create-id
function createId() {
  return postToServer( `${api}/create-id` )
    .then( data => data.meta.id );
}

const readId = settings => settings.get( "id" ) || "";
const writeId = ( settings, id ) => settings.set( "id", id ).save();

async function generateIdIfMissing( settings ) {
  const isMissing = !readId( settings );

  if ( isMissing ) {
    const id = await createId();
    writeId( settings, id );
  }
}

// add-manga
function addManga( id, manga, provider ) {
  postToServer( `${api}/add-manga`, { id, manga, provider } );
}
// remove-manga
function removeManga( id, manga, provider ) {
  postToServer( `${api}/remove-manga`, { id, manga, provider } );
}
// update-provider
function updateProvider( id, manga, provider ) {
  postToServer( `${api}/update-provider`, { id, manga, provider } );
}
// updates
const readHistory = settings => settings.get( "history" );

/**
 * Get all name, provider, chapter for manga with --subscribe
 */
function generateMangaList( settings ) {
  const history = readHistory( settings );

  const res = [];

  Object.keys( history ).forEach( manga => {
    const mangaObj = history[manga];

    if ( mangaObj.subscribe )
      res.push( {
        name    : manga,
        provider: mangaObj.provider,
        chapter : mangaObj.chapter,
      } );
  } );

  return res;
}

function getUpdates( id, mangaList ) {
  return postToServer( `${api}/updates`, { id, mangaList } )
    .then( payload => payload.data );
}

module.exports = {
  createId,
  addManga,
  updateProvider,
  removeManga,
  getUpdates,
  generateIdIfMissing,
  generateMangaList,
};
