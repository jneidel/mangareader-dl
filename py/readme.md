# mangareader-dl - DEPRECATED

Consider using the faster and more comfortable [node version](https://github.com/jneidel/mangareader-dl#mangareader-dl).

---

A commandline utility for downloading from [mangareader.net](http://www.mangareader.net/).

```bash
$ python3 mangareader-dl.py http://www.mangareader.net/onepunch-man/1
```

Given a url like above the utility will download all available chapters and convert them to `.cbr` for easy reading.

## Requirements

- [Python 3](https://www.anaconda.com/download/) (3.6.0)
- [requests](https://pypi.python.org/pypi/requests/2.18.4) (2.18.4)
- [beautifulsoup4](https://pypi.python.org/pypi/beautifulsoup4/4.6.0) (4.6.0)
- [Send2Trash](https://pypi.python.org/pypi/Send2Trash) (1.3.0)

Dependencies can be installed using pip:

```bash
$ pip install <package name>
```
---

- [mangareader-dl.py](https://raw.githubusercontent.com/jneidel/mangareader-dl/master/mangareader-dl.py) script

Download via wget:

```bash
$ wget https://raw.githubusercontent.com/jneidel/mangareader-dl/master/mangareader-dl.py
```

## Usage

First and only argument is the url:

```bash
$ python3 mangareader-dl.py http://www.mangareader.net/onepunch-man/1
```

For easier usage set an alias in your shell config:

```bash
alias manga="python3 ~/path/to/mangareader-dl.py"

$ manga http://www.mangareader.net/onepunch-man/1
```

Downloaded manga will be added to a folder in the same directory as the script:

```
├── mangareader-dl.py
└── Onepunch man
    ├── Onepunch-man 001.cbz
    └── Onepunch-man 002.cbz
```

Downloaded `.cbz` files can be viewed with [YACReader](http://www.yacreader.com/downloads).

# Attribution

Orignally written by [clearnote01](https://github.com/clearnote01). I only added the download of all available chapters as well as the `.cbz` conversion. [Original repo](https://github.com/clearnote01/Manga).
