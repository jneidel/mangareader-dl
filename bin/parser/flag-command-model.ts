export const model = {
  flags: {
    out: {
      short  : "o",
      require: "path",
      default: ".", // defaults.out,
    },
    dir: {
      short  : "d",
      default: true, // defaults.dir,
    },
    "no-dir": {
      short  : "D",
      default: false,
    },
    force: {
      short: "f",
    },
    provider: {
      short  : "p",
      require: "string",
      default: "mangareader", // defaults.provider,
    },
    micro: {
      short: "m",
    },
    subscribe: {
      short: "s",
    },
    latest: {
      short: "l",
    },
    silent : {},
    debug  : {},
    version: {
      short: "v",
    },
    help: {
      short: "h",
    },
    config: {
      short: "c",
      require: "path",
      default: "~/.mangareader-dl.json", // defaults.config
    }
  },
  commands: {
    // and flags used by each command
    flags: {
      config : "Path to config file (default: ~/.mangareader-dl.json)",
      version: "Print version and license information",
      help   : "Print help information",
    },
    usage   : [ "<SUBCOMMAND>", "<MANGA>" ],
    download: {
      description: "Download a manga by name or url",
      short      : "d",
      usage      : [ "<MANGA>" ],
      flags      : {
        "out <PATH>"     : "Output directory (default: .)",
        dir              : "Download files into <out>/<manga-name> (default: true)",
        "no-dir"         : "Disable --dir option",
        "provider <NAME>": "Site to download from",
        force            : "Overwrite history",
        subscribe        : "Download new chapters with 'update'",
        micro            : "Micro progress bar",
      },
    },
    list: {
      description: "List downloaded manga",
      short      : "l",
      usage      : [ "", "<SUBCOMMAND>" ],
      flags      : { latest: "Check if new chapters are available" },
      reset      : {
        description: "Remove non-subscribed manga",
        flags      : { force: "Remove all manga" },
      },
    },
    update: {
      description: "Update subscribed manga to the latest chapter",
      short      : "u",
      usage      : [ "", "<SUBCOMMAND>" ],
      flags      : {
        micro : "Micro progress bar",
        silent: "Hide progress bar and only output the download result",
      },
      check: {
        description: "Check if new chapters are available",
        usage      : [ "" ],
        flags      : {},
      },
    },
  },
};
