<h1 align="center">
    <img src="img/logo.png" alt="mangareader-dl">
</h1>

> CLI for comfortable manga download

![Project Status](https://img.shields.io/badge/status-Work_in_Progress-red.svg?style=flat-square)
![User tested](https://img.shields.io/badge/User_tested_on-mac-brightgreen.svg?style=flat-square)
<!--[![Travis Build Status](https://img.shields.io/travis/jneidel/mangareader-dl.svg?style=flat-square)](https://travis-ci.org/jneidel/mangareader-dl)-->
[![Npm Downloads](https://img.shields.io/npm/dw/mangareader-dl.svg?style=flat-square)](https://www.npmjs.com/package/mangareader-dl)
[![Licence MIT](https://img.shields.io/badge/licence-MIT-green.svg?style=flat-square)](https://github.com/jneidel/mangareader-dl/blob/master/licence)
[![Code Style Custom](https://img.shields.io/badge/code%20style-custom-ff69b4.svg?style=flat-square)](https://github.com/jneidel/dotfiles/blob/master/.eslintrc)

Convenient mass downloading from [mangareader.net](https://www.mangareader.net/) and other [supported sites](#supported-sites), easily download new chapters or resume downloads.

![](img/demo.gif)

```zsh
$ mangareader-dl naruto/699 -deo .

$ ls ./naruto
#=> naruto-699.cbz naruto-700.cbz
```

## Features

- Download all available chapters
- Resume downloads
- Download new chapters for all manga
- Set download location
- Configurable defaults
- Clean, informative interface

## FAQ

<details>
<summary><strong>Which comic book reader do you use?</strong></summary>
<br>
I use <a href="https://www.yacreader.com/">YACReader</a> [GNU/Linux, Mac, Win] (which I very much recommend) on my laptop and <a href="https://play.google.com/store/apps/details?id=com.eddysoft.comicviewer">Simple Comic Viewer</a> on my android.
<br><br>
</details>

<details>
<summary><strong>Why not just read online?</strong></summary>
<br>
<ul>
  <li><strong>Ads:</strong> No ads.</li>
  <li><strong>Keyboard Shortcuts:</strong> Using YACReader I can can scroll/flip a page by only pressing `spacebar` wheres in a browser I would need my to use my mouse.</li>
  <li><strong>Zoom:</strong> Using YACReader I can set a consistent zoom, that does not change on page flip and is easier scrollable than using the mouse or arrow keys.</li>
  <li><strong>Offline:</strong> A slow internet connection won't impact loading times. Access your manga everywhere.</li>
  <li><strong>State:</strong> YACReader saves how far you've read automatically, no need to manage bookmarks.</li>
  <li><strong>Battery:</strong> Turning off WiFi and not running your draining browser but a lightweight app like YACReader will be easy on your battery.</li>
  <li><strong>Convenience:</strong> Your reading is delayed only by the time it takes to download the first chapter. After that, judge for yourself.</li>
</details>

## Install

[![Npm Version](https://img.shields.io/npm/v/mangareader-dl.svg?style=flat-square)](https://www.npmjs.com/package/mangareader-dl)

```zsh
$ npm i mangareader-dl
```

## Usage

```
  mangareader-dl: CLI for comfortable manga download

  Usage
    $ mangareader-dl <manga>

  Commands
    <manga> Manga to download
    list    List downloaded manga
    config  Set defaults
    update  Update subscribed manga

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

## Examples

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

**Download new chapters:**

After marking a manga with the `--subscribe` flag at the initial download:

```zsh
$ mangareader-dl naruto -s
```

You can download new releases (for all marked manga) with:

```zsh
$ mangareader-dl update
```

See:

- [update](#update)
- [--subscribe](#--subscribe)

## <h2>Commands</h2>

### \<manga>[/chapter] [options]

Url or name of manga to download.

```zsh
$ mangareader-dl shingeki-no-kyojin # same as
$ mangareader-dl https://www.mangareader.net/shingeki-no-kyojin
```

A chapter can be specified using a `/` after the manga name: `shingeki-no-kyojin/100`.

```zsh
$ mangareader-dl shingeki-no-kyojin/100
```

Manga are downloaded in the `.cbz` (comic book zip) format.

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

### list

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

The `✓` in the second output above specifies whenever a manga has been [`--subscribe`](#--subscribe)d to.

**Reset history:**

Soft reset (keep [`--subscribe`](#--subscribe)d manga):

```zsh
$ mangareader-dl list reset
```

Hard reset:

```zsh
$ mangareader-dl list reset -f
```

### config [options]

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

**Current config:**

```zsh
$ mangareader-dl config

Current configuration:
  --out: /Users/jneidel/manga
  --dir: true
  --provider: mangareader
  --extended: true
```

**Config location:**

The cli checks if `~/.mangareader-dl.json` exists and otherwise writes to a local file. If you want your config and history to persit just create the global settings file:

In `~/.mangareader-dl.json`:

```json
{
  "config" : {},
  "history": {}
}
```

**Reset config:**

```zsh
$ mangareader-dl config reset
```

### update

Download new chapters for all manga that have been `--subscribe`d to.

```zsh
$ mangareader-dl update
```

Performs a n-time lookup for new chapters on all subscribed manga, followed by the download of these chapters into their provided paths.

**Example:**

`~/.mangareader-dl.json`:

```json
{
  "config": {...},
  "history": {
    "platinum-end": {
      "chapter": 20,
      "path": "/Users/jneidel/manga/platinum-end",
      "provider": "readmng",
      "subscribe": true
    },
    "onepunch-man": {
      "chapter": 136,
      "path": "/Users/jneidel/manga/onepunch-man",
      "provider": "mangareader",
      "subscribe": true
    },
  }
}
```

Latest chapter of `platinum-end` on `readmng` is `28`.

Latest chapter of `onepunch-man` on `mangareader` is `137`.

```zsh
$ mangareader-dl update

# Downloads:
#   'platinum-end' chapter 21-28
#   'onepunch-man' chapter 137
```

See:

- [--subscribe](#--subscribe)

## Options

Option flags of type boolean can be chained using their short form:

```zsh
$ mangareader-dl <manga> -dfe
# Options requiring a parameter can be chained at the end
$ mangareader-dl <manga> -dfeo <path>
```

### --out \<path>

<table><tr>
  <td>Alias: <code>-o</code></td>
  <td>Default: <code>./</code></td>
  <td>Type: <code>string</code></td>
</tr></table>

Set the output path.

```zsh
$ mangareader-dl shingeki-no-kyojin -o shingeki-no-kyojin

# Output path: './shingeki-no-kyojin'
```

**\<path>:** Required

### --dir

<table><tr>
  <td>Alias: <code>-d</code></td>
  <td>Default: <code>false</code></td>
  <td>Type: <code>boolean</code></td>
</tr></table>

Add a directory named after the manga to the path.

```zsh
$ mangareader-dl shingeki-no-kyojin -d

# Output path: './shingeki-no-kyojin'


$ mangerader-dl shingeki-no-kyojin -do ~/manga

# Output path: '~/manga/shingeki-no-kyojin'
```

### --provider \<site>

<table><tr>
  <td>Alias: <code>-p</code></td>
  <td>Default: <code>mangareader</code></td>
  <td>Type: <code>string</code></td>
</tr></table>

Specify site to download from.

```zsh
$ mangareader-dl shingeki-no-kyojin -p readmng
```

**\<site>:** Required

Must be in the list of [supported sites](#supported-sites).

Leave off the domain extension (eg: `.com`).

### --force

<table><tr>
  <td>Alias: <code>-f</code></td>
  <td>Default: <code>false</code></td>
  <td>Type: <code>boolean</code></td>
</tr></table>

Overwrite the corresponding entry in the [history](#list) with the currently specified data.

```zsh
$ mangareader-dl naruto -f
```

**Example:**

```zsh
$ mangareader-dl list
# ❯ Downloaded manga:
#   shingeki-no-kyojin - 104 [mangareader - /Users/jneidel/manga/shingeki-no-kyojin]

$ mangareader-dl shingeki-no-kyojin/100
#=> Continues download from history - downloading chapter 105

$mangareader-dl shingeki-no-kyojin/100 -f
#=> Downloads chapter 100+, overwrites history
```

### --extended

<table><tr>
  <td>Alias: <code>-e</code></td>
  <td>Default: <code>false</code></td>
  <td>Type: <code>boolean</code></td>
</tr></table>

Activate extended progress bar, which includes a separate bar for chapter progress.

```zsh
$ mangareader-dl shingeki-no-kyojin/100 -e

# ⠏ shingeki-no-kyojin [██████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]  21.4% | page      9/ 42
# ⠧        100         [█████████████████████████████████████████████████████░]  96.2% | chapter 100/104
```

### --micro

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

### --subscribe

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

Unset by passing `false` as argument: `$ mangareader-dl shingeki-no-kyojin -s false`.

## Supported sites

Currently supported sites include:

| site | status | speed | note |
|--|--|--|--|
| [mangareader.net](https://www.mangareader.net/) | ![mangareader status](https://img.shields.io/badge/status-working-brightgreen.svg?style=flat-square) | ![mangareader download speed](https://img.shields.io/badge/speed-fast-brightgreen.svg?style=flat-square) |  |
| [mangainn.net](http://www.mangainn.net/) | ![mangainn status](https://img.shields.io/badge/status-working-brightgreen.svg?style=flat-square) | ![mangainn download speed](https://img.shields.io/badge/speed-fast-brightgreen.svg?style=flat-square) |  |
| [readmng.com](https://www.readmng.com/) | ![readmng status](https://img.shields.io/badge/status-working-brightgreen.svg?style=flat-square) | ![readmng download speed](https://img.shields.io/badge/speed-medium-orange.svg?style=flat-square) |  |
| [mangalife.us](http://mangalife.us/) | ![mangalife status](https://img.shields.io/badge/status-working-brightgreen.svg?style=flat-square) | ![mangalife download speed](https://img.shields.io/badge/speed-medium-orange.svg?style=flat-square) |  |
| [goodmanga.com](http://www.goodmanga.net/) | ![goodmanga status](https://img.shields.io/badge/status-working-brightgreen.svg?style=flat-square) | ![goodmanga download speed](https://img.shields.io/badge/speed-slow-red.svg?style=flat-square) |  |
| [mangapanda.com](https://www.mangapanda.com/) | ![mangapanda status](https://img.shields.io/badge/status-working-brightgreen.svg?style=flat-square) | ![mangapanda download speed](https://img.shields.io/badge/speed-fast-brightgreen.svg?style=flat-square) | mangareader rehost |

If given a full url (eg: `www.mangareader.net/shingeki-no-kyojin`) the provider (site to download from) will be parsed from the url, using the name of the manga (eg: `shingeki-no-kyojin`) the default provider will be used. To use a different provider specify it with the [`--provider`](#--provider-site) flag.

```zsh
# Both download Attack on Titan from mangareader.net

$ mangareader-dl https://www.mangareader.net/shingeki-no-kyojin

$ mangareader-dl shingeki-no-kyojin --provider mangareader
```

To request support for an unsupported provider please open an [issue on GitHub](https://github.com/jneidel/mangareader-dl/issues/new?assignee=jneidel&body=**Supported%20Site%20Request:**).

## Test

```
$ npm run test
```

It's not run via Travis because there is a build error on the test server caused by one of the dependencies.

## Python version

For the rudimentary, legacy version written in python [click here](py).

## License

MIT © [Jonathan Neidel](https://jneidel.com)

Excludes [python version](py) adapted from [clearnote01](https://github.com/clearnote01).
