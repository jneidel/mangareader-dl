# mangareader-dl WIP

> CLI for downloading from mangareader.net and much more

![Project Status](https://img.shields.io/badge/status-Work_in_Progress/Unreleased-red.svg?style=flat-square)
[![Travis Build Status](https://img.shields.io/travis/jneidel/mangareader-dl.svg?style=flat-square)](https://travis-ci.org/jneidel/mangareader-dl)
[![Code Style Custom](https://img.shields.io/badge/code%20style-custom-ff69b4.svg?style=flat-square)](https://github.com/jneidel/dotfiles/blob/master/eslintrc)

<details>
<summary><strong>Table of Contents</strong></summary>

<!-- toc -->

- [API](#api)
- [Supported Sites](#supported-sites)
- [FAQ](#faq)

<!-- tocstop -->

</details><br>

This full-fledged Node version is still WIP and not yet released on npm. For a basic version see the [previous python version](py/readme.md).

---

Convenient mass downloading from [mangareader.net](https://www.mangareader.net/) and other [supported sites](#supported-sites) in the `.cbz` (Comic Book Zip) format. For the given manga it will download all available chapter, a later restart of the download process will continue downloading in the same directory, starting from the last saved chapter. Allowing for quick downloads of the newest chapters without changing specifying anything but the name or easily resumable bulk downloads.

```zsh
$ manga-dl shingeki-no-kyojin -o ~/aot
# Download all available chapters of Attack on Titan into '~/aot'

$ manga-dl https://www.mangareader.net/shingeki-no-kyojin/100 -d
# Download chapters 100+ of AoT into './shingeki-no-kyojin'
```

## API

```zsh
$ manga-dl help

Usage: manga-dl <manga> [options]

Commands:
  manga-dl <manga>  Manga to be downloaded, Format:
                    https://www.mangareader.net/shingeki-no-kyojin
                    shingeki-no-kyojin
                    shingeki-no-kyojin/<chapter>
  manga-dl list     List downloaded manga
  manga-dl config   Use flags to set their global defaults
                    -o .. Set global default output dir

Options:
  --out, -o       Output directory for downloaded manga
                        [string] [default: "/Users/jneidel/code/mangareader-dl"]
  --dir, -d       Download into the directory '<output>/<manga>'
                                                      [boolean] [default: false]
  --force, -f     Use given chapter/path instead of reading from history,
                  overwrite history                   [boolean] [default: false]
  --min, -m       Only show minimal output            [boolean] [default: false]
  --provider, -p  Specify site to download from
                  Options: [mangareader, readmng]       [default: "mangareader"]
  --help, -h      Display help this message                            [boolean]
  --version, -v   Show version number                                  [boolean]

Examples:
  $ manga-dl shingeki-no-kyojin --out       Download all available chapter of
  ~/aot                                     Attack on Titan into ~/aot
  $ manga-dl                                Download all available chapter of
  https://www.mangareader.net/shingeki-no-  Attack on Titan, starting at chapter
  kyojin/100                                100 into the current directory (./)
  $ manga-dl shingeki-no-kyojin -do         Download Attack on Titan into the
  ~/manga                                   directory ~/manga/shingeki-no-kyojin

For more information visit: https://github.com/jneidel/mangareader-dl
```

## Supported Sites

Currently supported sites include:

- [mangareader.net](https://www.mangareader.net/)
- [readmng.com](https://www.readmng.com/)

If given a full url (eg: `www.mangareader.net/shingeki-no-kyojin`) the provider (site to download from) will be parsed from the url, using a short url (eg: `shingeki-no-kyojin`) the default provider (`mangareader`) will be used. (Default can be set using the `config` command). To use a different provider specify it with the `-p`/`--provider` flag.

```zsh
# Both download Attack on Titan from mangareader.net

$ manga-dl https://www.mangareader.net/shingeki-no-kyojin
$ manga-dl shingeki-no-kyojin -p mangareader
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

