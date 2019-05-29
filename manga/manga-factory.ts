import { Provider, MultiPageProvider } from "../providers/models";
import { MultiPageManga } from ".";

export function mangaFactory( provider: Provider ) {
  if ( provider instanceof MultiPageProvider ) {
    return class ProviderMultiPageManga extends MultiPageManga {
      constructor( data ) {
        data = Object.assign( data, { provider } );
        super( data );
      }
    };
  } else {
    throw new TypeError( `invalid provider instance: ${provider}` );
  }
}
