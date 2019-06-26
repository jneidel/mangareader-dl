// import { model } from ".";
// const { flags } = model;

function validateProviders( flagValues, providers ): void {
  const { provider } = flagValues;
  const providerExists = providers.includes( provider );
  if ( !providerExists ) {
    console.log( `error: Invalid provider: '${provider}'.
To see all available providers try --help.

For more information try --help.` );
    process.exit();
  }
}

export function validateFlags( flagValues, commands, providers ) {
  validateProviders( flagValues, providers );
  return flagValues;
}
