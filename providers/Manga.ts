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
}

export class PageManga extends Manga {
  page: number;

  constructor( manga: Manga | {
    name: string;
    provider: Provider;
    path?: string;
    chapter?: number;
    page?: number;
  }, page?: number ) {
    super( manga );

    //@ts-ignore - page does not exist on Manga, but it does on the derived type
    this.page = manga.page || page || 1;
  }
}
