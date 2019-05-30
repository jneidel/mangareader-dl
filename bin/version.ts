import { resolve } from "path";
import { readFile } from "fs";
import { promisify } from "util";
const readFileAsync = promisify( readFile );

export default async function buildVersionString() {
  const pkgJsonPath = resolve( __dirname, "..", "..", "package.json" );
  const pkgJson = await readFileAsync( pkgJsonPath, { encoding: "utf-8" } );
  const { version } = JSON.parse( pkgJson );

  const licenseNotice = `mangareader-dl  Copyright (C) 2019  Jonathan Neidel

This is free software, and you are welcome to redistribute it
under the conditions of the GPLv3.

The source code along with the license can be found at:
https://github.com/jneidel/mangareader-dl`;

  return `v${version}\n${licenseNotice}`;
}
