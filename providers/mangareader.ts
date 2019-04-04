import { load as loadHtml } from "cheerio" ;
//@ts-ignore - axios has no exported member get
import { get } from "axios";

import * as utils from "./utils" ;
import * as log from "../lib/log" ;

export { get as ajax }
export const extension = "net";

export function getImgSrc( html ) {
  const $ = loadHtml( html.data );

  return $( "#img" ).attr( "src" );
};

export function getLastChapter ( html, numInName ) {
  const $ = loadHtml( html.data );

  const res = $( "#latestchapters" ).find( "a" )[0].children[0].data.match( /\s(\d+)/g );

  return numInName && res[1] ? res[1] : res[0];
};

export function getLastPage( html ) {
  const $ = loadHtml( html.data );

  return $( "#selectpage" )[0].children[1].data.match( /(\d+)/ )[0];
};

export function getImgBuffer ( imgSrc ) {
  let errorCounter = 0;

  const donwloadBuffer = url => get( url, { responseType: "arraybuffer", timeout: 0 } )
    .then( res => res.data )
    .then( data => Buffer.from( data, "binary" ) )
    .catch( err => {
      errorCounter++;
      if ( errorCounter === 10 ) {
        if ( err.response )
          return utils.missingImage();
        else
          log.error( `Error buffer downloading at ${url}`, { err } );
      } else {
        return donwloadBuffer( url );
      }
    } );

  return donwloadBuffer( imgSrc );
};

