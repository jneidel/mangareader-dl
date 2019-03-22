import { writeFile as fsWriteFile } from "mz/fs" ;
import { resolve as pathResolve } from "path" ;
import dirExists from "directory-exists" ;
import mkdir from "make-dir" ;
import Jszip from "jszip" ;
import { left as strpadLeft } from "strpad" ;
import * as log from "./log" ;

/**
 * Includes general purpose functions,
 * implemented into the download process in download.js
 */

import * as providers from "../providers" ;

const timeout = {
  counter: 10,
  msg    : "",
  /**
   * Increase counter, add msg, return whenever to continue or not
   */
  add( msg ) {
    if ( !this.counter ) {
      if ( this.msg.match( "Connection Error: Retrieving the last page from the url" ) ) {
        log.error( this.msg );
        throw new Error( this.msg ); // Set pagesTotal to 0
      } else {
        log.error( this.msg, {}, true );
      }
    }

    this.counter--;
    this.msg = msg;
  },
  /**
   * Reset counter after successful execution
   */
  reset() {
    this.counter = 10;
  },
};

/**
 * Parse image source url from given site
 * @returns {(string|Error)} - Returns img source url if not invalid page or chapter
 */
export function getImgSrcIfValid( url = this.url, provider = this.provider ) {
  const providerLib: any = providers.getLib( provider );

  return providerLib.ajax( url )
    .then( data => {
      const imgSrc = providerLib.getImgSrc( data );

      return imgSrc || new Error( `Invalid: ${url}` );
    } )
    .catch( err => new Error( `Invalid: ${url}` ) );
}

/**
 * Parse data from given url
 * @returns {object} - Incomplete manga object with name, chapter, page, provider
 */
export function parseFromUrl( url, passedProvider: String | null = null ) {
  let provider;
  if ( !passedProvider || url.startsWith( "http" ) ) {
    const match = String( url ).match( /(?:https?:\/\/)?(?:www.)?(.*)?(?:\.\w+\/)(.*)/ ); // Fallthrough match
    // [1] - domain
    // [2] - everything else
    if ( match ) {
      provider = match[1].split( "." )[0]; // Remove .com, etc.
      url = match[2];
    } else {
      log.error( "parseFromUrl did not match" );
    }
  } else {
    provider = passedProvider;
  }

  const providerLib = providers.getLib( provider );
  if ( providerLib === null ) {
    log.promptConsole( `The provider "${provider}" is not supported.\n  Please view the supported providers here:\n  https://github.com/jneidel/mangareader-dl#supported-sites` );
    return process.exit();
  }

  const { name, chapter, page } = providerLib.parseUrl( url );

  return {
    name   : name.toLowerCase(),
    provider,
    chapter: Number( chapter ),
    page   : Number( page ),
  };
}

/**
 * Create url from given inputs
 */
export function createUrl( provider, name, chapter, page = 1 ) {
  provider = `${provider}.${providers.extensions[provider]}`;

  if ( provider === "mangalife.us" )
    return `https://${provider}/read-online/${name}-chapter-${chapter}-page-${page}.html`;

  return `https://www.${provider}/${name}/${chapter}/${page}`;
};

/**
 * Create manga object from given url
 * @returns {object} - Manga object containing name, chapter, page, siteUrl, imgSrc, outputPath, provider
 */
export function createManga( url, outputPath: String | null = null, provider: String | null = null ) {
  const manga = parseFromUrl( url, provider );
  manga.chapter = manga.chapter || 1;
  manga.page = manga.page || 1;

  return Object.assign( manga, {
    outputPath,
    url      : createUrl( manga.provider, manga.name, manga.chapter, manga.page ),
    getImgSrc: getImgSrcIfValid,
  } );
}

/**
 * Chapter + 1, regenerate url, return newly created new manga object
 */
export function increase( manga ) {
  manga.chapter += 1;
  manga.page = 1;

  manga.url = createUrl( manga.provider, manga.name, manga.chapter, manga.page );

  return getImgSrcIfValid( manga.url, manga.provider )
    .then( imgSrc => {
      manga.imgSrc = imgSrc;
      return manga.imgSrc instanceof Error ? null : manga;
    } );
}

/**
 * Downloads the given image and returns its buffer
 */
export function downloadImg( manga ) {
  const providerLib: any = providers.getLib( manga.provider );

  return manga.getImgSrc()
    .then( imgSrc => providerLib.getImgBuffer( imgSrc )
      .then( buffer => { timeout.reset(); return buffer; } )
      .catch( err => {
        manga.getImgSrc().then( src => timeout.add( `Connection Error: Downloading image from the url '${src}'` ) );
        return downloadImg( manga );
      } )
    );
};

/**
 * Create cbz file from an array of buffers representing the pages of the chapter
 * @param {buffer[]} buffers
 */
export async function createZip( buffers, name, chapter, outputPath ) {
  const zip = new Jszip();

  buffers.sort( ( a, b ) => a.n - b.n );

  const outputPathExists = await dirExists( outputPath );
  if ( !outputPathExists )
    mkdir( outputPath );

  outputPath = pathResolve( outputPath, `${name}-${strpadLeft( chapter, 3, 0 )}.cbz` );

  let i = 1;
  for ( const buffer of buffers ) {
    await zip.file( `${name}-${strpadLeft( chapter, 3, 0 )}-${strpadLeft( i, 3, 0 )}.jpg`, buffer.buff, { binary: true } );
    i++;
  }

  return zip.generateAsync( { type: "uint8array" } )
    .then( data => fsWriteFile( outputPath, data, { encoding: null } )
      .then( () => outputPath )
      .catch( err => err ) );
}

function handle404( err, name, provider ) {
  if ( err.response.status === 404 )
    log.prompt( `The manga '${name}' doesn't exist/doesn't have chapters on '${provider}'` );
  process.exit(); // eslint-disable-line unicorn/no-process-exit
}

export async function getLastChapter( name, provider ) {
  const providerLib: any = providers.getLib( provider );

  let url = `http://www.${provider}.${providers.extensions[provider]}/${name}`;
  const numInName = name.match( /\d/ ); // Else null

  if ( provider === "mangalife" )
    url = providerLib.getNameUrl( name );

  return Promise.resolve( url )
    .then( url => providerLib.ajax( url )
      .catch( err => handle404( err, name, provider ) )
    )
    .then( html => {
      const lastChapter = providerLib.getLastChapter( html, numInName );
      return Number( lastChapter );
    } )
    .then( chapter => { timeout.reset(); return chapter; } )
    .catch( err => {
      timeout.add( `Connection Error: Retrieving the last chapter from the url '${url}'` );
      return getLastChapter( name, provider );
    } );
};

export function getLastPage( url, provider ) {
  const providerLib: any = providers.getLib( provider );

  return providerLib.ajax( url )
    .then( html => {
      const providerLib: any = providers.getLib( provider );
      const lastPage = providerLib.getLastPage( html );
      return Number( lastPage );
    } )
    .then( page => { timeout.reset(); return page; } )
    .catch( err => {
      timeout.add( `Connection Error: Retrieving the last page from the url '${url}'` );
      return getLastPage( url, provider );
    } );
};

