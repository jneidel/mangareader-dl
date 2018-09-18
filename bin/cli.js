#!/usr/bin/env node

const fs = require( "mz/fs" );
const path = require( "path" );
const meow = require( "meow" );
const errHndlr = require( "err-hndlr" );

const i = require( "../lib" );
const s = require( "../lib/settings" );
const log = require( "../lib/log" );
const cliCommands = require( "../lib/cli-commands" );

const supportedProviders = Object.keys( require( "../lib/providers" ).extensions );

( async function main() {
  const settingsPath = await s.getSettingsPath();
  const settings = s.createSettingsObject( settingsPath );
  const defaults = s.parseDefaults( settings );

  const cli = meow( `
    Usage
      $ mangareader-dl <manga>

    Commands
      <manga> Manga to download
      list    List downloaded manga
      config  Set defaults
      update  Update subscribed manga

    Options, Sub-commands
      <manga>
        -o, --out       Set output path
        -d, --dir       Download into 'path/manga-name'
        -p, --provider  Set download site
        -f, --force     Overwrite history
        -s, --subscribe Subscribe to new chapters
        -m, --micro     Micro progress bar
      list
        -l, --latest    Highlight if new chapters are available
        reset           Reset non-subscribed manga
          -f, --force   Reset history
      config
        -o, --out       Set default output path
        -d, --dir       Enable/disable dir option
        -p, --provider  Set default provider
        reset           Reset config
      update
        -m, --micro     Micro progress bar
            --silent    Hide progress bar
        check           Check if new chapters are available
      --version         Show version
      --help            This help message
      --debug           Throw errors locally

    Examples
      $ mangareader-dl mangareader.net/naruto/100 -do .
      => Download naruto chapter 100+ into cwd

      $ mangareader-dl naruto -mp mangareader
      => Download naruto from mangareader.net in micro mode

    For the full documentation please refer to:
    https://github.com/jneidel/mangareader-dl

  `, {
    description: "mangareader-dl: CLI for comfortable manga download",
    flags      : {
      out: {
        alias  : "o",
        type   : "string",
        default: defaults.out,
      },
      dir: {
        alias  : "d",
        type   : "boolean",
        default: defaults.dir,
      },
      force: {
        alias  : "f",
        type   : "boolean",
        default: false,
      },
      provider: {
        alias  : "p",
        type   : "string",
        default: defaults.provider,
      },
      micro: {
        alias  : "m",
        type   : "boolean",
        default: false,
      },
      subscribe: {
        alias  : "s",
        type   : "boolean",
        default: false,
      },
      latest: {
        alias  : "l",
        type   : "boolean",
        default: false,
      },
      silent: {
        type   : "boolean",
        default: false,
      },
      debug: {
        type   : "boolean",
        default: false,
      },
    },
  }
  );

  // Clean up input
  const args = cli.flags;
  args._ = cli.input;

  if ( args._.length === 0 ) {
    log.prompt( "Specify '--help' for available commands" );
    process.exit();
  }

  [ { name: "out", val: args.out }, { name: "provider", val: args.provider } ].forEach( arg => {
    if ( arg.val === "" ) {
      log.prompt( `The '--${arg.name}' flag requires a parameter. Specify '--help' for available commands` );
      process.exit();
    }
  } );

  let outputPath = path.normalize( args.out );
  outputPath = path.isAbsolute( args.out ) ? args.out : path.resolve( process.cwd(), args.out );

  if ( !~supportedProviders.indexOf( args.provider ) ) {
    log.prompt( `The provider '${args.provider}' is not supported. Please choose one from the list:\n  [${supportedProviders}]\n  Or submit a issue on GitHub requesting support of the given provider.` );
    process.exit();
  }

  args.bar = args.micro ? "micro" : "extended"; // micro > extended

  const isReset = args._[1] === "reset";

  // Initialize error handler
  const throwErrorCondition = args.debug;
  const errorRestApi = "https://api.jneidel.com/errors/submit";
  const errorBaseData = { id: "11fbf6a8-40ea-461f-af94-333280bb3c41" };
  errHndlr.init( throwErrorCondition, errorRestApi, errorBaseData, { app: require( "../package.json" ), os: true } )
    .catch( err => {} ); // Ignore 'no connection' errors

  // Parse commands
  switch ( args._[0] ) {
    case "list":
      cliCommands.list( settings, isReset ? { settingsPath, force: args.force } : null, args.latest );
      break;
    case "config":
      cliCommands.config( args, settings, defaults, outputPath, isReset ? settingsPath : null );
      break;
    case "update":
      cliCommands.update( args, settings );
      break;
    default: // <manga>
      cliCommands.manga( args, outputPath, settings );
  }
} )();

process.on( "unhandledRejection", ( err ) => { throw err; } );
