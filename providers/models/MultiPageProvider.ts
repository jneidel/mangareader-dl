import { Provider } from ".";
import { Manga, Page } from "../../manga";

export abstract class MultiPageProvider extends Provider {
  constructor( name, extension ) {
    super( name, extension );
  }

  public abstract createUrl( manga: Page, isOverview?: boolean ): string;

  public abstract getLastPage( manga: Manga ): Promise<number>;

  public abstract getLastChapter( manga: Manga ): Promise<number>;

  public abstract getImageSource( manga: Page ): Promise<string>;
}

