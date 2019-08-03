import { Manga } from "../../manga";

export abstract class Provider {
  name: string;
  extension: string;

  constructor( name: string, extension: string ) {
    this.name = name;
    this.extension = extension;
  }

  public abstract parseShortUrl( url: string ): Manga;

  public abstract exists( manga: Manga ): Promise<boolean>;

  public abstract getImageBuffer( imageSource: string ): Promise<any>; // return type is buffer
}

