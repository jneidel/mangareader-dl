import { MultiPageManga } from ".";
import { MultiPageProvider } from "../providers/models";

/*
 * Page for multi page manga, where
 * there is one page per one website
 */

export class Page {
  manga; // parent manga
  provider: MultiPageProvider;
  name: string;
  chapter: number;
  url: string;

  page: number;

  constructor( manga: MultiPageManga, page?: number ) {
    this.manga = manga;
    this.provider = manga.provider;
    this.name = manga.name;
    this.chapter = manga.chapter;

    this.page = page || 1;

    this.url = this.provider.createUrl( this );
  }

  createUrl( isOverview?: boolean ) {
    return this.provider.createUrl( this, isOverview );
  }

  getImageSource() {
    return this.provider.getImageSource( this );
  }

  getImageBuffer( imageSource: string ) { // Same as on Manga
    return this.provider.getImageBuffer( imageSource );
  }
}

export function pageFactory( manga: MultiPageManga ) {
  return class MangaPage extends Page {
    constructor( page?: number ) {
      super( manga, page );
    }
  }
}
