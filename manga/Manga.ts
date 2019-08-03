import Zip from "jszip";
import dirExists from "directory-exists";
import mkdir from "make-dir";
import { left as strpadLeft } from "strpad";
import path from "path";
import { writeFile as fsWriteFile } from "mz/fs";
import { promisify } from "util";
const writeFile = promisify( fsWriteFile );
import { Provider } from "../providers/models";

export class Manga {
  name: string;
  provider: Provider;
  path: string;
  chapter: number;

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

  async createZip( buffers: { n: number; buff: any }[] ): Promise<void> {
    const { name, chapter } = this;
    const paddedChapter = strpadLeft( chapter, 3, 0 );
    let outputPath = this.path;

    buffers.sort( ( a, b ) => a.n - b.n );

    const zip = new Zip();

    dirExists( outputPath ).then( outputPathExists => {
      !outputPathExists && mkdir( outputPath );
    } );

    outputPath = path.resolve( outputPath, `${name}-${paddedChapter}.cbz` );

    let i = 1;
    for ( const buffer of buffers ) {
      await zip.file(
        `${name}-${paddedChapter}-${strpadLeft( i, 3, 0 )}.jpg`,
        buffer.buff,
        { binary: true },
      );
      i++;
    }

    zip
      .generateAsync( { type: "uint8array" } )
      .then( zipBuffer => writeFile( outputPath, zipBuffer, { encoding: null } ) );
  }

  getImageBuffer( imageSource: string ) {
    return this.provider.getImageBuffer( imageSource );
  }
}

