import parser from "../command-parser";

test( "parser", () => {
  const commands = [ "d", "naruto" ]
  const answer = [ "download", "naruto" ]

  const result = parser( commands );
  expect( result ).toEqual( answer );
} );

