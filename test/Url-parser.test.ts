import UrlParser from "../providers/Url-parser" ;

const shared = {
  url: "shingeki-no-kyojin/103/39",
  answer: {
    name: "shingeki-no-kyojin",
    chapter: 103,
    page: 39,
  }
}

test( "parse mangareader url", () => {
  const parser = new UrlParser( "mangareader" );
  const result = parser.parse( shared.url )
  expect( result ).toEqual( shared.answer )
} );

test( "parse mangainn url", () => {
  const parser = new UrlParser( "mangainn" );
  const result = parser.parse( shared.url )
  expect( result ).toEqual( shared.answer )
} );

test( "parse readmng url", () => {
  const parser = new UrlParser( "readmng" );
  const result = parser.parse( shared.url )
  expect( result ).toEqual( shared.answer )
} );

test( "parse mangapanda url", () => {
  const parser = new UrlParser( "mangapanda" );
  const result = parser.parse( shared.url )
  expect( result ).toEqual( shared.answer )
} );


test( "parse mangalife page url", () => {
  const urls = [
    "Platinum-End-chapter-31-page-4.html",
    "read-online/Platinum-End-chapter-31-page-4.html",
  ]
  const answer = {
    name: "platinum-end",
    chapter: 31,
    page: 4,
  }

  urls.forEach( url => {
    const parser = new UrlParser( "mangalife" );
    const result = parser.parse( url )
    expect( result ).toEqual( answer )
  }
} );

test( "parse mangalife overview url", () => {
  const url = "manga/kemono-jihen"
  const answer = {
    name: "kemono-jihen",
    chapter: 1,
    page: 1,
  }

  const parser = new UrlParser( "mangalife" );
  const result = parser.parse( url )
  expect( result ).toEqual( answer )
} );

test( "parse mangalife chapter overview url", () => {
  const url = "kemono-jihen/12"
  const answer = {
    name: "kemono-jihen",
    chapter: 12,
    page: 1,
  }

  const parser = new UrlParser( "mangalife" );
  const result = parser.parse( url )
  expect( result ).toEqual( answer )
} );

