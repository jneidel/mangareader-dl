# mangareader-dl

> CLI for downloading from mangareader.net and much more

![Project Status](https://img.shields.io/badge/status-Work_in_Progress-red.svg?style=flat-square)
[![Travis Build Status](https://img.shields.io/travis/jneidel/mangareader-dl.svg?style=flat-square)](https://travis-ci.org/jneidel/mangareader-dl)
[![Npm Downloads](https://img.shields.io/npm/dt/mangareader-dl.svg?style=flat-square)](https://www.npmjs.com/package/mangareader-dl)
[![Code Style Custom](https://img.shields.io/badge/code%20style-custom-ff69b4.svg?style=flat-square)](https://github.com/jneidel/dotfiles/blob/master/eslintrc)

Convenient mass downloading from [mangareader.net](https://www.mangareader.net/) and other [supported sites](#supported-sites).
Given the name or url `mangareader-dl` will download all available chapters of the manga.

<p align="center">
  <a href="https://asciinema.org/a/175766" target="_blank">
    <img src="https://asciinema.org/a/175766.png" width="650" />
  </a>
</p>

```zsh
$ mangareader-dl naruto/699 -deo .

# Result:
# ├── ./
# └── naruto
#     ├── naruto-699.cbz
#     └── naruto-700.cbz
```

## Features

- Downloads all available chapters
- Continue downloading where the last download stopped
- Specify download location
- Bundle manga in `.cbz` (comic book zip) format
- Clean, informative interface
- Configurable defaults (output path, etc.)

## Table of contents

- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
  - [Commands](#commands)
    - [\<manga>](#mangachapter-options)
    - [list](#list)
    - [config](#config-options)
  - [Options](#options)
    - [--out](#--out-path)
    - [--dir](#--dir)
    - [--provider](#--provider)
    - [--force](#--force)
    - [--extended](#--extended)
- [Supported sites](#supported-sites)
- [FAQ](#faq)
- [Python version](#python-version)

## Installation

![Project Status](https://img.shields.io/badge/status-Work_in_Progress-red.svg?style=flat-square)
[![Npm Version](https://img.shields.io/npm/v/mangareader-dl.svg?style=flat-square)](https://www.npmjs.com/package/mangareader-dl)

```zsh
$ npm i mangareader-dl
```

## Usage

These examples will showcase common use cases as well as introduce available commands and options. For more on the individual commands/options view the [API docs](#api).

**Download from chapter:**

Download all chapters of Attack on Titan from 100 onward:

```zsh
$ mangareader-dl shingeki-no-kyojin/100
# Or the long version
$ mangareader-dl https://www.mangareader.net/shingeki-no-kyojin/100

# Output path: './'
```

For more on the download command, see [\<manga>](#mangachapter-options).

**Output directoy:**

Download all chapters of AoT  into the path '~/manga/shingeki-no-kyojin' by specifying the `--out` (output path) and `--dir` (downloading into a folder named after the manga):

```zsh
$ mangareader-dl shingeki-no-kyojin -do ~/manga
# Or the long version
$ mangareader-dl https://www.mangareader.net/shingeki-no-kyojin --dir --out '~/manga'

# Output path: '~/manga/shingeki-no-kyojin'
```

For more on the [`--out`](#--out-path) and [`--dir`](#--dir) options, see their documentation.

**Continue from history:**

Does not need any config, per default mangareader-dl saves a manga's download history, site, as well as path. So starting a download with the following flags:

```zsh
$ mangareader-dl shingeki-no-kyojin/10 -o aot

# Output path (same as for next two): './aot'
```

Resuming the download, after stopping it, can be done by only specifying:

```zsh
$ mangareader-dl shingeki-no-kyojin
```

If you need to re-download something, just overwrite the history with `--force`:

```zsh
$ mangareader-dl shingeki-no-kyojin/10 -fo aot
```

For more on the [`--force`](#--force) option or the [list](#list) command (print history), see their documentation.

**Other sites:**

Download from a different site than the default (mangareader.net) by either using the full url, or specifying it via the `--provider` flag:

```zsh
$ mangareader-dl shingeki-no-kyojin -p readmng
# Or specifying the site via url
$ mangareader-dl https://www.readmng.com/shingeki-no-kyojin

# Output path: './'
```

For all available site, see [supported sites](#supported-sites). For more on specifying a provider, see [`--provider`](#--provider).

**Change defaults:**

Specify the options you want to set while using the `config` command.

```zsh
$ mangareader-dl config -do ~/manga -p mangareader
```

For more on editing the configuration, see [config](#config-options).

## API

```zsh
$ mangareader-dl help

Usage: mangareader-dl <manga> [options]

Commands:
  mangareader-dl <manga>  Manga to be downloaded, Format:
                          https://www.mangareader.net/shingeki-no-kyojin
                          shingeki-no-kyojin
                          shingeki-no-kyojin/<chapter>
  mangareader-dl list     List downloaded manga
  mangareader-dl config   Use flags to set their global defaults
                          -o .. Set global default output dir

Options:
  --out, -o       Output directory for downloaded manga
                        [string] [default: "/Users/jneidel/code/mangareader-dl"]
  --dir, -d       Download into the directory '<output>/<manga>'
                                                      [boolean] [default: false]
  --force, -f     Use given chapter/path instead of reading from history,
                  overwrite history                   [boolean] [default: false]
  --extended, -e  Show an extended output             [boolean] [default: false]
  --provider, -p  Specify site to download from
                  Options: [mangareader, readmng]       [default: "mangareader"]
  --help, -h      Display help this message                            [boolean]
  --version, -v   Show version number                                  [boolean]

Examples:
  $ mangareader-dl shingeki-no-kyojin       Download all available chapter of
  --out ~/aot                               Attack on Titan into ~/aot
  $ mangareader-dl                          Download all available chapter of
  https://www.mangareader.net/shingeki-no-  Attack on Titan, starting at chapter
  kyojin/100                                100 into the current directory (./)
  $ mangareader-dl shingeki-no-kyojin -do   Download Attack on Titan into the
  ~/manga                                   directory ~/manga/shingeki-no-kyojin

For more information visit: https://github.com/jneidel/mangareader-dl
```

### <h2>Commands</h2>

#### <h3>\<manga>[/chapter] [options]</h3>

Url or name of manga to download.

```zsh
$ mangareader-dl shingeki-no-kyojin
```

A chapter can be specified using a `/` after the manga name: `shingeki-no-kyojin/100`.

```zsh
$ mangareader-dl shingeki-no-kyojin/100
```

**Available options:**

- [--out](#--out-path) <path>
- [--dir](#--dir)
- [--provider](#--provider)
- [--extended](#--extended)
- [--force](#--force)

**Possible formats:**

- shingeki-no-kyojin
- mangareader.net/shingeki-no-kyojin
- www.mangareader.net/shingeki-no-kyojin
- http://www.mangareader.net/shingeki-no-kyojin
- https://www.mangareader.net/shingeki-no-kyojin

#### <h3>list</h3>

Output the history of downloaded manga, as well as their last chapter, provider and location on disk.

This list is used for continuing downloads.

```zsh
$ mangareader-dl list

# ❯ Downloaded manga:
#   hunter-x-hunter - 380 [mangareader - /Users/jneidel/manga/hunter-x-hunter]
#   onepunch-man - 136 [readmng - /Users/jneidel/manga/onepunch-man]
```

To continue the download of `onepunch-man` starting at chapter 137 specify:

```zsh
$ mangareader-dl onepunch-man
```

**Reset history:**

The history (output of `list`) can be reset by specifying `list reset`:

```zsh
$ mangareader-dl list reset
```

There is no way to undo this.

#### <h3>config [options]</h3>

Update the global defaults by specifying them as options:

```zsh
$ mangareader-dl -do ~/manga -p mangareader
```

**Available options:**

- [--out](#--out-path) <path>
- [--dir](#--dir)
- [--provider](#--provider)

**--out:**

Default: `./`

**--provider:**

Default: `mangareader`

**--dir:**

Default: false

Activate by passing `-d/--dir` on every config call.

Deactivate by *not* passing `-d/--dir` on config calls.

**Reset config:**

The configuration can be reset by specifying `config reset`:

```zsh
$ mangareader-dl config reset
```

There is no way to undo this.

### Options

Option flags of type boolean can be chained using their short form:

```zsh
$ mangareader-dl <manga> -dfe
# Or chaining a flag that requires a parameter at the end
$ mangareader-dl <manga> -dfeo <path>
```

#### <h3>--out \<path></h3>

Alias: `-o` / Default: `./`

Set the output path.

```zsh
$ mangareader-dl shingeki-no-kyojin --out aot

# Output path: './aot'
```

**\<path>:**

Required

`<path>` can be either absolute or relative (`./` isn't required for relative paths). Wrapping the path isn't necessary.

#### <h3>--dir</h3>

Alias: `-d` / Type: `Boolean`

Add a directory named after the manga to the path.

```zsh
$ mangareader-dl shingeki-no-kyojin -do

# Output path: './aot'
```

#### <h3>--provider \<site></h3>

Alias: `-p` / Default: `mangareader`

Specify site to download from.

```zsh
$ mangareader-dl shingeki-no-kyojin -p readmng
```

**\<site>:**

Must be in the list of [supported sites](#supported-sites).

Leave off the domain extension (eg: `.com`).

**Available sites:**

- mangareader
- readmng

#### <h3>--force</h3>

Alias: `-f` / Type: `Boolean`

Overwrite the corresponding entry in the [history](#list) with the currently specified data.

```zsh
$ mangareader-dl list
# ❯ Downloaded manga:
#   shingeki-no-kyojin - 104 [mangareader - /Users/jneidel/manga/shingeki-no-kyojin]

$ mangareader-dl shingeki-no-kyojin/100
#=> Continues download from history - downloading chapter 105

$mangareader-dl shingeki-no-kyojin/100 -f
#=> Downloads chapter 100+, overwrites history
```

#### <h3>--extended</h3>

Alias: `-e` / Type: `Boolean`

Activate extended progress bar, which includes a separate chapter bar.

```zsh
$ mangareader-dl shingeki-no-kyojin/100

# ⠏ shingeki-no-kyojin [██████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]  21.4% | page      9/ 42
# ⠧        100         [█████████████████████████████████████████████████████░]  96.2% | chapter 100/104
```

## Supported sites

Currently supported sites include:

- [mangareader.net](https://www.mangareader.net/)
- [readmng.com](https://www.readmng.com/)

If given a full url (eg: `www.mangareader.net/shingeki-no-kyojin`) the provider (site to download from) will be parsed from the url, using a short url (eg: `shingeki-no-kyojin`) the default provider (`mangareader`) will be used. (Default can be set using the [config](#config-options) command). To use a different provider specify it with the [`--provider`](#--provider) flag.

```zsh
# Both download Attack on Titan from mangareader.net

$ mangareader-dl https://www.mangareader.net/shingeki-no-kyojin

$ mangareader-dl shingeki-no-kyojin --provider mangareader
```

To request support for an unsupported provider please open an [issue on GitHub](https://github.com/jneidel/mangareader-dl/issues/new?assignee=jneidel&body=**Supported%20Site%20Request:**).

## FAQ

**Which comic book reader do you use?**

I use [YACReader](https://www.yacreader.com/) (which I very much recommend) on my laptop and [Simple Comic Viewer](https://play.google.com/store/apps/details?id=com.eddysoft.comicviewer) on my android.

**Why not just read online?**

- Ads: No ads.
- Keyboard Shortcuts: Using YACReader I can can scroll/flip a page by only pressing `spacebar` wheres in a browser I would need my to use my mouse.
- Zoom: Using YACReader I can set a consistent zoom, that does not change on page flip and is easier scrollable than using the mouse or arrow keys.
- Offline: A slow internet connection won't impact loading times. Access your manga everywhere.
- State: YACReader saves how far you've read automatically, no need to manage bookmarks.
- Battery: Turning off WiFi and not running your draining browser but a lightweight app like YACReader will be easy on your battery.
- Convenience: Your reading is delayed only by the time it takes to download the first chapter. After that, judge for yourself.

## Test

```
$ npm run test
```

## Python version

For the rudimentary, legacy version written in python [click here](py).
