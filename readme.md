# mangareader-dl

> 💾 CLI for comfortable manga download

![Project Status](https://img.shields.io/badge/status-Work_in_Progress-red.svg?style=flat-square)
[![Travis Build Status](https://img.shields.io/travis/jneidel/mangareader-dl.svg?style=flat-square)](https://travis-ci.org/jneidel/mangareader-dl)
[![Licence MIT](https://img.shields.io/badge/licence-MIT-green.svg?style=flat-square)](https://github.com/jneidel/mangareader-dl/blob/master/licence)
[![Npm Downloads](https://img.shields.io/npm/dw/mangareader-dl.svg?style=flat-square)](https://www.npmjs.com/package/mangareader-dl)
[![Code Style Custom](https://img.shields.io/badge/code%20style-custom-ff69b4.svg?style=flat-square)](https://github.com/jneidel/dotfiles/blob/master/eslintrc)

Convenient mass downloading from [mangareader.net](https://www.mangareader.net/) and other [supported sites](#supported-sites).
Given the name or url `mangareader-dl` will download all available chapters of the manga.

![](img/demo.gif)

```zsh
$ mangareader-dl naruto/699 -deo .

$ ls ./naruto
#=> naruto-699.cbz naruto-700.cbz
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
- [CLI](#cli)
  - [Commands](#commands)
    - [\<manga>](#mangachapter-options)
    - [list](#list)
    - [config](#config-options)
  - [Options](#options)
    - [--out](#--out-path)
    - [--dir](#--dir)
    - [--provider](#--provider-site)
    - [--force](#--force)
    - [--extended](#--extended)
    - [--micro](#--micro)
    - [--subscribe](#--subscribe)
- [Supported sites](#supported-sites)
- [FAQ](#faq)
- [Test](#test)
- [Python version](#python-version)
- [License](#license)

## Installation

![Project Status](https://img.shields.io/badge/status-Work_in_Progress-red.svg?style=flat-square)
[![Npm Version](https://img.shields.io/npm/v/mangareader-dl.svg?style=flat-square)](https://www.npmjs.com/package/mangareader-dl)

```zsh
$ npm i mangareader-dl
```

## Usage

These examples will showcase common use cases. View the [API docs](#api) for more info on the individual commands.

**Download starting at given chapter:**

```zsh
$ mangareader-dl naruto/100

# Output path: './'
```

See:

- [`<manga>`](#mangachapter-options)

**Set output directoy:**

```zsh
$ mangareader-dl naruto -do ~/manga

# Output path: '~/manga/naruto'
```

See:

- [`--out`](#--out-path)
- [`--dir`](#--dir)

**Continue download from history:**

A mangas last downloaded `chapter`, its `provider` and `path` are saved. So the following download:

```zsh
$ mangareader-dl naruto/10 -o naruto

# Output path (same as for next two): './naruto'
```

can be resumed with:

```zsh
$ mangareader-dl naruto
```

If you need to re-download something, just overwrite the history with `--force`:

```zsh
$ mangareader-dl naruto/10 -fo naruto
```

See:

- [`list`](#list)
- [`--force`](#--force)

**Download from different site:**

```zsh
$ mangareader-dl naruto -p readmng
# Or specifying the site via url
$ mangareader-dl https://www.readmng.com/naruto
```

See:

- [supported sites](#supported-sites)
- [`--provider`](#--provider-site)

## CLI

```zsh
  mangareader-dl: CLI for comfortable manga download

  Usage
    $ mangareader-dl <manga>

  Commands
    <manga> Manga to download
    list    List downloaded manga
    config  Set defaults

  Options
    --out, -o       Set output path
    --dir, -d       Download into 'path/manga-name'
    --provider, -p  Set download site
    --force, -f     Overwrite history
    --subscribe, -s Subscribe to new chapters
    --extended, -e  Extended progress bar
    --micro, -m     Micro progress bar

  Examples
    $ mangareader-dl mangareader.net/naruto/100 -do .
    => Download naruto chapter 100+ into cwd

    $ mangareader-dl naruto -mp mangareader
    => Download naruto from mangareader.net in micro mode

  For the documentation please refer to:
  https://github.com/jneidel/mangareader-dl
```

### <h2>Commands</h2>

#### <h3>\<manga>[/chapter] [options]</h3>

Url or name of manga to download.

```zsh
$ mangareader-dl shingeki-no-kyojin # same as
$ mangareader-dl https://www.mangareader.net/shingeki-no-kyojin
```

A chapter can be specified using a `/` after the manga name: `shingeki-no-kyojin/100`.

```zsh
$ mangareader-dl shingeki-no-kyojin/100
```

**Available options:**

- [--out `<path>`](#--out-path)
- [--dir](#--dir)
- [--provider `<site>`](#--provider-site)
- [--force](#--force)
- [--extended](#--extended)
- [--micro](#--micro)
- [--subscribe](#--subscribe)

**Possible formats:**

- `shingeki-no-kyojin`
- `mangareader.net/shingeki-no-kyojin`
- `www.mangareader.net/shingeki-no-kyojin`
- `http://www.mangareader.net/shingeki-no-kyojin`
- `https://www.mangareader.net/shingeki-no-kyojin`

#### <h3>list</h3>

Output the history of downloaded manga, as well as their last chapter, provider and location on disk.

This list is used for continuing downloads.

```zsh
$ mangareader-dl list

# ❯ Downloaded manga:
#     onepunch-man       137 [mangareader /Users/jneidel/manga/onepunch-man]
#     platinum-end        28 [readmng     /Users/jneidel/manga/platinum-end]
#   ✓ shingeki-no-kyojin 104 [mangareader /Users/jneidel/manga/shingeki-no-kyojin]
```

To continue the download of `onepunch-man` starting at chapter 138 execute:

```zsh
$ mangareader-dl onepunch-man
```

The `✓` in the output above specifies whenever a manga has been [subscribed](#--subscribe) to.

**Reset history:**

The history (output of `list`) can be reset by specifying `list reset`:

```zsh
$ mangareader-dl list reset
```

#### <h3>config [options]</h3>

Update the global defaults by specifying them as options:

```zsh
$ mangareader-dl config -deo ~/manga -p mangareader
```

**Available options:**

| option | parameter | default |
|--|--|--|
| [--out](#--out-path) | `<path>` | `./` |
| [--provider](#--provider-site) | `<site>` | `mangareader` |
| [--dir](#--dir) | `true` / `false` | `false` |
| [--extended](#--extended) | `true` / `false` | `false` |

Passing no options will print current config.

**Config location:**

The cli checks if `~/.mangareader.json` exists and otherwise writes to a local file. If you want your config and history to persit just create the global settings file:

In `~/.mangareader.json`:

```json
{
  "config" : {},
  "history": {}
}
```

**Reset config:**

The configuration can be reset by specifying `config reset`:

```zsh
$ mangareader-dl config reset
```

### Options

Option flags of type boolean can be chained using their short form:

```zsh
$ mangareader-dl <manga> -dfe
# Options requiring a parameter can be chained at the end
$ mangareader-dl <manga> -dfeo <path>
```

#### <h3>--out \<path></h3>

<table><tr>
  <td>Alias: <code>-o</code></td>
</tr></table>

Set the output path.

```zsh
$ mangareader-dl shingeki-no-kyojin --out aot

# Output path: './aot'
```

**\<path>:**

<table><tr>
  <td>Required</td>
  <td>Default: <code>./</code></td>
  <td>Type: <code>string</code></td>
</tr></table>

#### <h3>--dir</h3>

<table><tr>
  <td>Alias: <code>-d</code></td>
  <td>Default: <code>false</code></td>
  <td>Type: <code>boolean</code></td>
</tr></table>

Add a directory named after the manga to the path.

```zsh
$ mangareader-dl shingeki-no-kyojin -do aot

# Output path: './aot'
```

#### <h3>--provider \<site></h3>

<table><tr>
  <td>Alias: <code>-p</code></td>
</tr></table>

Specify site to download from.

```zsh
$ mangareader-dl shingeki-no-kyojin -p readmng
```

**\<site>:**

<table><tr>
  <td>Required</td>
  <td>Default: <code>mangareader</code></td>
  <td>Type: <code>string</code></td>
</tr></table>

Must be in the list of [supported sites](#supported-sites).

Leave off the domain extension (eg: `.com`).

**Available sites:**

- mangareader
- readmng

#### <h3>--force</h3>

<table><tr>
  <td>Alias: <code>-f</code></td>
  <td>Default: <code>false</code></td>
  <td>Type: <code>boolean</code></td>
</tr></table>

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

<table><tr>
  <td>Alias: <code>-e</code></td>
  <td>Default: <code>false</code></td>
  <td>Type: <code>boolean</code></td>
</tr></table>

Activate extended progress bar, which includes a separate chapter bar.

```zsh
$ mangareader-dl shingeki-no-kyojin/100 -e

# ⠏ shingeki-no-kyojin [██████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]  21.4% | page      9/ 42
# ⠧        100         [█████████████████████████████████████████████████████░]  96.2% | chapter 100/104
```

#### <h3>--micro</h3>

<table><tr>
  <td>Alias: <code>-m</code></td>
  <td>Default: <code>false</code></td>
  <td>Type: <code>boolean</code></td>
</tr></table>

Activate micro progress bar. Has precedence over `--extended`.

```zsh
$ mangareader-dl shingeki-no-kyojin/100 -m

# ⠏ shingeki-no-kyojin 100/104 26%
```

#### <h3>--subscribe</h3>

<table><tr>
  <td>Alias: <code>-s</code></td>
  <td>Default: <code>false</code></td>
  <td>Type: <code>boolean</code></td>
</tr></table>

Subscribe to given manga, activate download of new chapters using the [`update`](#update) command.

```zsh
$ mangareader-dl shingeki-no-kyojin/100 -s

# Subscription is specified by the ✓ in 'list':

$ mangareader-dl list
# ❯ Downloaded manga:
#     onepunch-man              137 [readmng     /Users/jneidel/manga/onepunch-man]
#   ✓ shingeki-no-kyojin        104 [mangareader /Users/jneidel/manga/shingeki-no-kyojin]
```

Unset using the `false` parameter: `$ mangareader-dl shingeki-no-kyojin -s false`.

## Supported sites

Currently supported sites include:

- [mangareader.net](https://www.mangareader.net/):

    ![mangareader status](https://img.shields.io/badge/status-working-brightgreen.svg?style=flat-square)
    ![mangareader download speed](https://img.shields.io/badge/speed-fast-brightgreen.svg?style=flat-square)

- [readmng.com](https://www.readmng.com/):

    ![readmng status](https://img.shields.io/badge/status-working-brightgreen.svg?style=flat-square)
    ![readmng download speed](https://img.shields.io/badge/speed-medium-orange.svg?style=flat-square)

- [goodmanga.com](http://www.goodmanga.net/):

    ![goodmanga status](https://img.shields.io/badge/status-working-brightgreen.svg?style=flat-square)
    ![goodmanga download speed](https://img.shields.io/badge/speed-slow-red.svg?style=flat-square)

If given a full url (eg: `www.mangareader.net/shingeki-no-kyojin`) the provider (site to download from) will be parsed from the url, using the name of the manga (eg: `shingeki-no-kyojin`) the default provider will be used. To use a different provider specify it with the [`--provider`](#--provider-site) flag.

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

## License

MIT © [Jonathan Neidel](https://jneidel.com)

Excludes [python version](py) adapted from [clearnote01](https://github.com/clearnote01).
