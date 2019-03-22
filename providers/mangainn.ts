import { load as loadHtml } from "cheerio" ;

//@ts-ignore - axios has no exported member get
export { get as ajax } from "axios"
export { getImgBuffer, parseUrl } from "./mangareader";
export const extension = "net";

export function getImgSrc( html ) {
  const $ = loadHtml( html.data );

  if ( $( "#chapter_img" )[0] )
    return $( "#chapter_img" )[0].attribs.src;
  else
    return $( ".img-responsive" )[0].attribs.src;
};

export function getLastChapter( html ) {
  const $ = loadHtml( html.data );

  const lastChapterUrl = $( "#chapter_list" )[0].children[3].children[1].children[1].attribs.href;
  const [ , chapter ] = lastChapterUrl.match( /(?:https?:\/\/)?(?:www.)?(?:mangainn.net)?(?:\/)?(?:[^/]+)\/?(\d+)?\/?/i );

  return chapter;
};

export function getLastPage( html ) {
  const $ = loadHtml( html.data );

  return Math.floor( $( ".selectPage" )[0].children[1].children.length / 2 );
};

