export default abstract class Provider {
  name: string; // provider name, eg mangareader
  extension: string; // provider extension, eg net
  //abstract constructor( Downloader: Downloader ) => void;
  constructor( name: string, extension: string ) {
    this.name = name;
    this.extension = extension;
  }
  //Downloader: Downloader; - downloading module
  abstract download(): Promise<boolean>;
}

