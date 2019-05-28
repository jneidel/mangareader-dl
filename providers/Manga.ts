import Zip from "jszip";
import dirExists from "directory-exists";
import mkdir from "make-dir";
import { left as strpadLeft } from "strpad";
import path from "path";
import { writeFile as fsWriteFile } from "mz/fs";
import { promisify } from "util";
const writeFile = promisify( fsWriteFile );
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
