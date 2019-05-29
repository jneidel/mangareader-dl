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
}

