import Provider from "./Provider";
// @ts-ignore - axios has no exported member get
import { get as axios } from "axios";
import { load as loadHtml } from "cheerio";
import { PageManga } from "./Manga";

export default class Mangareader extends Provider {
  constructor() {
    super( "mangareader", "net" );
  }

  ajax = axios;

  parseShortUrl( url ) {
    const defaultMatch = [ , "", 1, 1 ];

    const [ , name, chapter = 1, page = 1 ] =
      url.match( /([^/]+)\/?(\d+)?\/?(\d+)?/ ) || defaultMatch;

    const manga = new PageManga( {
      name    : name.toLowerCase(),
      chapter : Number( chapter ),
      provider: this,
      page    : Number( page ),
    } );
    return manga;
  }

  createUrl( manga, isOverview = false ) {
    const { name, chapter, page } = manga;
    const provider = `${this.name}.${this.extension}`;

    let url = `https://www.${provider}/${name}/${chapter}/${page}`;

    if ( isOverview ) url = `https://www.${provider}/${name}`;

    return url;
  }

  exists( manga ) {
    const overviewUrl = this.createUrl( manga, true );

    return this.ajax( overviewUrl )
      .then( () => true )
      .catch( () => false ); // 404 or other client/server errors
  }

  getLastPage( manga ) {
    const { name, chapter } = manga;
    const firstPageUrl = this.createUrl( { name, chapter, page: 1 } );

    return this.ajax( firstPageUrl ).then( html => {
      const $ = loadHtml( html.data );
      const lastPage = $( "#selectpage" )[0].children[1].data.match( /(\d+)/ )[0];
      return Number( lastPage );
    } );
  }

  getLastChapter( manga ) {
    const overviewUrl = this.createUrl( manga, true );

    const hasNumberInName = !!manga.name.match( /\d/ );

    return this.ajax( overviewUrl ).then( html => {
      const $ = loadHtml( html.data );
      const match = $( "#latestchapters" )
        .find( "a" )[0]
        .children[0].data.match( /\s(\d+)/g );

      const lastChapter = hasNumberInName && match[1] ? match[1] : match[0]; // If number in name: first match will be that number
      return Number( lastChapter );
    } );
  }

  getImageSource( manga ) {
    const { url } = manga;

    return this.ajax( url )
      .then( html => {
        const $ = loadHtml( html.data );
        return $( "#img" ).attr( "src" );
      } )
      .catch( err => {
        throw new Error( "invalid page" );
      } );
  }
}
