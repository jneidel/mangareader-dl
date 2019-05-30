import * as parser from "..";
const { model } = parser;

test( "splitShortFlags", () => {
  const argv = [ "-dfo", "dir" ];
  const answer = [ "-d", "-f", "-o", "dir" ];

  const result = parser.splitShortFlags( argv );
  expect( result ).toEqual( answer );
} );

test( "extendShortFlags", () => {
  const argv = [ "-d", "-f", "-o", "dir" ];
  const answer = [ "--dir", "--force", "--out", "dir" ];

  const result = parser.extendShortFlags( argv );
  expect( result ).toEqual( answer );
} );

test( "turnFlagsIntoValues", () => {
  const argv = [ "list", "--dir", "--force", "--out", "dir" ];
  const answer = {
    commands  : [ "list" ],
    flagValues: {
      out      : "dir",
      dir      : true,
      force    : true,
      "no-dir" : false,
      provider : model.flags.provider.default,
      micro    : false,
      subscribe: false,
      latest   : false,
      silent   : false,
      debug    : false,
      help     : false,
      version  : false,
    },
  };

  const result = parser.turnFlagsIntoValues( argv );
  expect( result ).toEqual( answer );
} );

test( "parser", () => {
  const argv = [ "node", "cli.js", "list", "-dfo", "dir" ];
  const answer = {
    commands: [ "list" ],
    flags   : {
      out      : "dir",
      dir      : true,
      force    : true,
      "no-dir" : false,
      provider : model.flags.provider.default,
      micro    : false,
      subscribe: false,
      latest   : false,
      silent   : false,
      debug    : false,
      help     : false,
      version  : false,
    },
  };

  const result = parser.flagParser( argv );
  expect( result ).toEqual( answer );
} );
