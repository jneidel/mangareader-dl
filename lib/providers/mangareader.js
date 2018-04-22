exports.getImgSrc = $ => $( "#img" ).attr( "src" );

exports.getLastChapter = $ => $( "#latestchapters" ).find( "a" )[0].children[0].data.match( /(\d+)/ )[0];

exports.getLastPage = $ => $( "#selectpage" )[0].children[1].data.match( /(\d+)/ )[0];
