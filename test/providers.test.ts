import * as providers from "../providers";

const expectedProviders = [
  "mangareader",
  "mangapanda",
  "mangalife",
  "mangainn",
  "readmng",
]

test( "get providers array", () => {
  const result = providers.list;

  expect( result.sort() ).toEqual( expectedProviders.sort() );
} )

test( "providers are in list", () => {
  expectedProviders.forEach( provider => {
    expect( providers.isProvider( provider ) ).toBeTruthy();
  } )
} )

