// Import Downloader from "./Downloader";
import Manga, { PageManga } from "./Manga";

export default abstract class Provider {
  name: string;
  extension: string;
  constructor( name: string, extension: string ) {
    this.name = name;
    this.extension = extension;
  }

  public abstract parseShortUrl( string ): PageManga;

  public abstract createUrl( manga: PageManga, isOverview?: boolean ): string;

  public abstract exists( manga: Manga ): Promise<boolean>;

  public abstract getLastPage( manga: Manga ): Promise<number>;

  public abstract getLastChapter( manga: Manga ): Promise<number>;

  public abstract getImageSource( manga: PageManga ): Promise<string>;

  public abstract getImageBuffer( imageSource: string ): Promise<any>; // return type is buffer

  /* Download( ...args ) { */
  // const downloader = new Downloader( this.name );
  // return downloader.download( ...args );
  /* } */
}
