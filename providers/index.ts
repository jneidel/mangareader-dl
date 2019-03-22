import * as mangareader from "./mangareader" ;
import * as readmng from "./readmng" ;
import * as mangainn from "./mangainn" ;
import * as mangalife from "./mangalife" ;

const extensions = {
  mangareader: mangareader.extension,
  mangapanda : "com", // Reuses mangareader file, but not same extension
  readmng    : readmng.extension,
  mangainn   : mangainn.extension,
  mangalife  : mangalife.extension,
};

const getLib = provider =>
  provider === "mangareader" ? mangareader :
  provider === "mangalife" ? mangalife :
  provider === "mangainn" ? mangainn :
  provider === "readmng" ? readmng :
  provider === "mangapanda" ? mangareader :
  null; // Provider does not match

export { extensions, getLib }

