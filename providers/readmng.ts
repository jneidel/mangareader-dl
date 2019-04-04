import { load as loadHtml } from "cheerio" ;
import pify from "pify" ;
import * as cloudscraper from "cloudscraper" ;
import * as log from "../lib/log" ;

export const extension = "com";
export const ajax = pify( cloudscraper.get, { multiArgs: true } );

export function getImgSrc( data ) {
  const html = data[1];
  const $ = loadHtml( html );

  return $( "#chapter_img" ).attr( "src" );
};

export function getLastChapter( data ) {
  const html = data[1];
  const $ = loadHtml( html );

  if ( $( ".chp_lst" )[0] === undefined || $( ".chp_lst" )[0].children.length < 2 ) {
    log.prompt( `The manga doesn't exist/doesn't have chapters on 'readmng'` );
    process.exit(); // eslint-disable-line unicorn/no-process-exit
  }

  return $( ".chp_lst" )[0].children[1].children[1].attribs.href.match( /www\.[^/]+\/[^/]+\/(\d+)/i )[1];
};

export function getLastPage( data ) {
  const html = data[1];
  const $ = loadHtml( html );

  const dropdown = $( "select[name=category_type]" )[1].children;

  return dropdown[dropdown.length - 2].children[0].data;
};

export function getImgBuffer( imgSrc ) {
  return pify( cloudscraper.request, { multiArgs: true } )( {
    method  : "GET",
    encoding: null,
    url     : imgSrc,
  } )
    .then( res => res[1] )
    .then( data => Buffer.from( data, "binary" ) );
};

