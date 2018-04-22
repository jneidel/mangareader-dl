exports.getImgSrc = $ => $( "#chapter_img" ).attr( "src" );

exports.getLastChapter = $ => $( ".chp_lst" )[0].children[1].children[1].attribs.href.match( /www\.[^/]+\/[^/]+\/(\d+)/i )[1];

exports.getLastPage = $ => {
  const dropdown = $( "select[name=category_type]" )[1].children;
  return dropdown[dropdown.length - 2].children[0].data;
};
