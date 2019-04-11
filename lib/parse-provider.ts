//import { isProvider } from "../providers" ;

export function parseProviderFromUrl(
  url: string,
  passedProvider: string | null = null
): {
  url: string,
  provider: string,
} {
  if ( passedProvider ) { // Already validated in bin/cli
    return {
      url, // Assumes that provider is passed EITHER with full url or with -p flag
      provider: passedProvider,
    };
  }

  const match = url.match( /(?:https?:\/\/)?(?:www.)?(.*)?(?:\.\w+\/)(.*)/ );
  if ( !match ) {
    throw new Error( "passed url does not fit the schema" )
  } else {
    return {
      url: match[2],
      provider: match[1].split( "." )[0], // Remove .com, etc
    }
  }
}

