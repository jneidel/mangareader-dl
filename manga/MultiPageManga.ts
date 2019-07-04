import { Manga, pageFactory } from ".";
import { MultiPageProvider } from "../providers/models";

export class MultiPageManga extends Manga {
  provider: MultiPageProvider; // Needs to be explicitly assigned here, otherwise TS is not sure that it's MultiPage

  constructor( data: {
    name: string;
    provider: MultiPageProvider;
    path?: string;
    chapter?: number;
  } ) {
    super( data );

    this.provider = data.provider;
  }

  Page = pageFactory( this );

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

  loop() {
    return this.provider.loop( this );
  }
}
