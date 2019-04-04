export default class UrlParser {
  private provider: string;
  constructor( provider ) {
    this.provider = provider;
  }

  public parse( url: string ): {
    name: string,
    chapter: number,
    page: number
  } {
    const defaultMatch = [ , "", 1, 1 ];
    let name, chapter, page;

    switch( this.provider ) {
      case "mangareader":
      case "mangainn":
      case "readmng":
      case "mangapanda":
        [ , name, chapter = 1, page = 1 ] = url.match( /([^/]+)\/?(\d+)?\/?(\d+)?/ ) || defaultMatch;
        break;
      case "mangalife":
        let result;
        if ( url.match( /\.html\/?$/i ) ) { // page url
          result = url.match( /(?:read-online\/)?(.+?(?=-chapter-))-chapter-(\d+)-page-(\d+)?.html/i ) || defaultMatch;
        } else if ( url.match( /^manga/i ) ) { // overview url
          result = url.match( /(?:manga\/)([^/]+)/ ) || defaultMatch;
        } else { // chapter overview url
          result = url.match( /([^/]+)\/?(\d+)?\/?(\d+)?/ ) || defaultMatch;
        }
        [ , name, chapter = 1, page = 1 ] = result;
        break;
    }

    return {
      name: name.toLowerCase(),
      chapter: Number( chapter ),
      page: Number( page )
    };
  }
}
