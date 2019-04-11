import UrlParser from "./Url-parser";

export default abstract class Provider {
  name: string;
  extension: string;
  constructor( name: string, extension: string ) {
    this.name = name;
    this.extension = extension;
  }

  // Downloader: Downloader; - downloading module
  //abstract download(): Promise<boolean>;

  parse( url: string ) {
    const parser = new UrlParser( this.name );

    return parser.parse( url );
  }
}
