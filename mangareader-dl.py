import os, requests, sys, re, shutil, send2trash
from bs4 import BeautifulSoup
dir_name = ""
first = True
done = False
manga = ""
chapter = ""
url = ""
webp = ""

# Give url of image and image name
def saveimg(url, name):
    req = requests.get(url)
    with open(name, 'wb') as f:
        for chunk in req.iter_content(128):
            f.write(chunk)

# Creates a name based on manga name, ch and page
def makeName(manga, ch, page):
    if page =='':
        page = 1
    return '{}-{}-{}'.format(manga, ch, page)

# Give current status of download
def statusDownload(i, pages, name):
    if i == 0:
        print('\nStarting download from: {}'.format(name))
        sys.stdout.write('\n[')
    frac = 100/pages
    frac = int(round(frac))
    opline  = '='*frac
    sys.stdout.write(opline)
    sys.stdout.flush()

# Main loop
def mainfunc(url = ""):
    global manga, chapter, webp, dir_name, first, done
    skip = False

    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    if first:
        try:
            url = sys.argv[1]
        except:
            print('ERROR: URL not given.')
            raise EnvironmentError
    pages = - 1
    pattern = re.compile(r'^(\w+://\w+.\w+.\w+/)(.*?)/(.*?)(/(.*?))?$')
    mo = pattern.search(url)
    try:
        webp = mo.group(1)
        manga = mo.group(2)
        chapter = int(mo.group(3))
        if mo.group(5) == None:
            page = ''
        else: page = int(mo.group(5))
    except:
        print('ERROR: Regex of URL not matched')
        raise EnvironmentError
    i = 0

    if len(str(chapter)) == 1:   zero = " 00"
    elif len(str(chapter)) == 2: zero = " 0"
    else:                        zero = " "
    dir_name = " ".join(manga.split("-")) + zero + str(chapter)

    try:
        manga_formatted = (" ".join(manga.split("-"))).capitalize()
        if os.path.exists(manga_formatted):
            os.chdir(manga_formatted)
            if os.path.exists(dir_name):
                os.chdir(dir_name)
            else:
                os.makedirs(dir_name)
                os.chdir(dir_name)
        else:
            os.makedirs(manga_formatted)
            os.chdir(manga_formatted)
            if os.path.exists(dir_name):
                os.chdir(dir_name)
            else:
                os.makedirs(dir_name)
                os.chdir(dir_name)

    except:
        print(
            "Seperate directory for the manga can't be created.\nDo you want to download in the current directory(y/n)")
        ans = input()
        if ans == 'y':
            pass
        else:
            sys.exit("Download cancelled")

    while True:
        url = '{}{}/{}/{}'.format(webp, manga, chapter, page)
        while True:
            try:
                r = requests.get(url)
                break
            except:
                print("A Connection Error Occured.")

        soup = BeautifulSoup(r.content, "lxml")

        if soup.text == '404 Not Found':
            chapter += 1
            page = ''
        elif soup.find('div', attrs={'id': 'recom_info'}) != None:
            sys.stdout.write( "\nAll availables chapters have been downloaded.\n" )
            done = True
            break
        else:
            if pages == - 1:
                # initialise number of pages if not given
                opt = soup.find_all("option")
                for x in range(0,len(opt)):
                    if opt[x].get("selected")=="selected":
                        pages = len(opt)-x
                        break
            imgtags = soup.find_all("img")
            # Since my url has only one img tag, that's that
            imgsrc = imgtags[0].get("src")
            # requests object of the imgsrc url
            name = makeName(manga, chapter, page)
            if os.path.exists(name) is False:
                saveimg(imgsrc, name + ".jpg")
            statusDownload(i, pages, name)
            if page == '': page = 2
            else:          page += 1
            i += 1

            try:  # Exiting when there is no selector - when all available chapters have been downloaded
                pat = re.compile(r"\d+\n\s+of\s\d+")
                outpt = re.search(pat, soup.text)
                outpt.group()
            except AttributeError:
                pages = i

            if i == pages:
                sys.stdout.write(']\nDownload finished at: {}\n'.format(name))
                break
    zipToCBZ(dir_name)
    first = False


def zipToCBZ(dir_name):
    os.chdir("../")
    shutil.make_archive(dir_name.strip("/"), 'zip', os.path.join(os.getcwd(), dir_name))
    os.rename(os.path.join(os.getcwd(), dir_name + ".zip"),
              os.path.join(os.getcwd(), dir_name + ".cbz"))
    send2trash.send2trash(os.path.join(os.getcwd(), dir_name))

mainfunc()
while not done:
    chapter += 1
    mainfunc(webp + manga + "/" + str(chapter)) 

