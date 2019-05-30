const model = {
  flags: {
    out: {
      short  : "o",
      require: "string",
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
  },
  commands: {
    // and flags used by each command
    flags: {
      help   : "Print help information",
      version: "Print version and license information",
    },
    download: {
      description: "Download a manga by name or url",
      short      : "d",
      flags      : {
        "out <path>"    : "Output directory",
        dir             : "Download files into <out>/<manga-name>",
        "no-dir"        : "Disable --dir option",
        "provider <str>": "Site to download from",
        force           : "Overwrite history",
        subscribe       : "Download new chapters with 'update'",
        micro           : "Micro progress bar",
      },
    },
    list: {
      description: "List downloaded manga",
      short      : "l",
      flags      : { latest: "Check if new chapters are available" },
      reset      : {
        description: "Remove non-subscribed manga",
        flags      : { force: "Remove all manga" },
      },
    },
    update: {
      description: "Update subscribed manga to the latest chapter",
      short      : "u",
      flags      : {
        micro : "Micro progress bar",
        silent: "Hide progress bar and only output the download result",
      },
      check: {
        description: "Check if new chapters are available",
        flags      : {},
      },
    },
  },
};
export default model;
