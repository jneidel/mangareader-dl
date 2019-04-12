// Import Downloader from "./Downloader";
import Manga, { PageManga } from "./Manga";

export default abstract class Provider {
  name: string;
  extension: string;
  constructor( name: string, extension: string ) {
    this.name = name;
    this.extension = extension;
  }

  abstract parseShortUrl( string ): PageManga;

  abstract exists( manga: Manga ): Promise<boolean>;

  abstract createUrl( manga: PageManga ): string;

  abstract getLastPage( manga: Manga ): Promise<number>;

  abstract getLastChapter( manga: Manga ): Promise<number>;

  /* Download( ...args ) { */
  // const downloader = new Downloader( this.name );
  // return downloader.download( ...args );
  /* } */
}
