import range from "py-range";
import promiseMap from "p-map";
import { Provider } from ".";
import { mangaFactory, MultiPageManga, Page } from "../../manga";

export abstract class MultiPageProvider extends Provider {
  constructor( name, extension ) {
    super( name, extension );
  }

  public abstract createUrl( manga: Page, isOverview?: boolean ): string;

  public abstract getLastPage( manga: MultiPageManga ): Promise<number>;

  public abstract getLastChapter( manga: MultiPageManga ): Promise<number>;

  public abstract getImageSource( manga: Page ): Promise<string>;

  Manga = mangaFactory( this );

  async loop( manga: MultiPageManga ) {
    const lastPage = await manga.lastPage;

    const pages = range( 1, lastPage + 1 ).map(
      pageNumber => new manga.Page( pageNumber ),
    );

    const buffers: { buffer: any; n: number }[] = [];
    async function downloadPage( page: Page ) {
      const source = await page.getImageSource();
      const buffer = await page.provider.getImageBuffer( source );
      console.log( "Downloaded", page.page );

      buffers.push( { buffer, n: page.page } );
    }

    await promiseMap( pages, downloadPage, { concurrency: 4 } );
    buffers.sort( ( a, b ) => a.n - b.n );

    // Create zipfile in path
    // Fix path first though
  }
}
