const axios = require( "axios" );
const { readHistory, getMangaSubscribe } = require( "./settings" );

/**
 * Contains functions for interacting with the api at api.jneidel.com for the 'update' command
 */

// const api = "https://api.jneidel.com/mangareader";
const api = "http://localhost:62220/mangareader";

// Utils
function handleResponseError( data ) {
  if ( data.meta.err ) {
    const err = data.meta.err;
    console.log( "API Error: ", err );
  } else {
    return data;
  }
}
function postToServer( url, payload = {} ) {
  return axios.post( url, payload )
    .then( response => response.data )
    .then( data => handleResponseError( data ) )
    .catch( err => handleResponseError( err.response.data ) );
}

// Functions corresponding with the apis routes
function createId() {
  return postToServer( `${api}/create-id` )
    .then( data => data.meta.id );
}
function addManga( id, manga, provider ) {
  postToServer( `${api}/add-manga`, { id, manga, provider } );
}
function removeManga( id, manga, provider ) {
  postToServer( `${api}/remove-manga`, { id, manga, provider } );
}
function updateProvider( id, manga, provider ) {
  postToServer( `${api}/update-provider`, { id, manga, provider } );
}
function getUpdates( id, settings ) {
  const mangaList = getMangaSubscribe( settings );

  return postToServer( `${api}/updates`, { id, mangaList } )
    .then( payload => payload.data );
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

module.exports = {
  createId,
  addManga,
  updateProvider,
  removeManga,
  getUpdates,
  generateIdIfMissing,
};
