import { load as loadHtml } from "cheerio" ;

//@ts-ignore - axios has no exported member get
export { get as ajax } from "axios"
export { getImgBuffer } from "./mangareader";
export const extension = "us";

export function getImgSrc( html ) {
  const $ = loadHtml( html.data );

  return $( ".CurImage" )[0].attribs.src;
};

export function getLastChapter(  html ) {
  const $ = loadHtml( html.data );

  const lastChapterUrl = $( ".chapter-list" )[0].children[1].attribs.href;

  const [ , chapter ] = lastChapterUrl.match( /-chapter-(\d+)/i );

  return chapter;
};

export function getLastPage( html ) {
  const $ = loadHtml( html.data );

  return Math.floor( $( ".PageSelect" )[0].children.length );
};


/**
 * Get the manga page (site/manga-name) for mangalife
 * Can't be generated as it has unique id in url (eg: goodmanga.net/17702/dr.-stone)
 */
export function getNameUrl( name ) {
  return `https://mangalife.us/manga/${name}`;
}

