import Mangareader from "../providers/Mangareader";

test( "initiate Mangareader correctly", () => {
  const provider = new Mangareader();

  expect( provider.name ).toBe( "mangareader" );
} );

