import { commandParser as parser } from "..";

test( "parser", () => {
  const commands = [ "d", "naruto" ];
  const answer = [ "download", "naruto" ];

  const result = parser( commands );
  expect( result ).toEqual( answer );
} );

