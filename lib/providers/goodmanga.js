exports.getImgSrc = $ => $( "#manga_viewer" )[0].children[3].children[0].attribs.src;

exports.getLastChapter = $ => {
  const lastChapterUrl = $( "#chapters" )[0].children[3].children[1].children[1].attribs.href;
  const [ , , chapter ] = lastChapterUrl.match( /(?:https?:\/\/)?(?:www.)?(?:goodmanga.net)?(?:\/)?([^/]+)\/?(?:chapter\/)?(\d+)?\/?(\d+)?/i );

  return chapter;
};

exports.getLastPage = $ => $( "#manga_nav_top" )[0].children[3].children[5].children[0].data.match( /\d+/ )[0];
