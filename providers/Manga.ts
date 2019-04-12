import Provider from "./Provider";

export default class Manga {
  name: string;
  provider: Provider;
  path: string = "";
  chapter: number = 1;

  constructor( data: {
    name: string;
    provider: Provider;
    path?: string;
    chapter?: number;
  } ) {
    this.name = data.name;
    this.provider = data.provider;
    this.path = data.path || ""; // Get default path from settings
    this.chapter = data.chapter || 1;
  }

  exists(): Promise<boolean> {
    return this.provider.exists( this );
  }

  private _lastPage: number | null = null;

  get lastPage(): Promise<number> {
    if ( this._lastPage ) {
      return Promise.resolve( this._lastPage );
    } else {
      return this.provider.getLastPage( this ).then( lastPage => {
        this._lastPage = lastPage;
        return lastPage;
      } );
    }
  }

  private _lastChapter: number | null = null;

  get lastChapter(): Promise<number> {
    if ( this._lastChapter ) {
      return Promise.resolve( this._lastChapter );
    } else {
      return this.provider.getLastChapter( this ).then( lastChapter => {
        this._lastChapter = lastChapter;
        return lastChapter;
      } );
    }
  }
}

export class PageManga extends Manga {
  page: number;
  url: string;

  constructor(
    manga:
      | Manga
      | {
          name: string;
          provider: Provider;
          path?: string;
          chapter?: number;
          page?: number;
        },
    page?: number,
  ) {
    super( manga );

    // @ts-ignore - page does not exist on Manga, but it does on the derived type
    this.page = manga.page || page || 1;

    this.url = this.provider.createUrl( this );
  }
}
