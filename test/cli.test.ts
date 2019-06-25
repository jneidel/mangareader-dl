import execa from "execa";

import { promisify } from "util";
import { readFile } from "fs";
const readFileAsync = promisify(readFile);
import { resolve } from "path";

async function cli(commands: string[]) {
  const cliFileLocation = resolve(__dirname, "..", "dist", "bin", "cli.js");

  const { stdout } = await execa("node", [cliFileLocation].concat(commands));
  return stdout;
}

test("version flags", async () => {
  const pkgJson = await readFileAsync(
    resolve(__dirname, "..", "package.json"),
    { encoding: "utf8" },
  );
  const currentVersion = JSON.parse(pkgJson).version;

  const results: any = await Promise.all([
    cli(["--version"]),
    cli(["-v"]),
    cli(["list", "-v"]),
  ]);

  results.forEach(result => {
    const version = result.match(/v(\d.\d.\d)/)[1];
    expect(version).toBe(currentVersion);

    const hasGPL = result.match(/GPL/);
    expect(hasGPL).toBeTruthy();
  });
});

test("--help", async () => {
  const result = await cli(["--help"]);

  const hasDownloadCommand = result.match(/d, download/);
  expect(hasDownloadCommand).toBeTruthy();
  const hasListCommand = result.match(/l, list/);
  expect(hasListCommand).toBeTruthy();
  const hasUpdateCommand = result.match(/u, update/);
  expect(hasUpdateCommand).toBeTruthy();
});
test("download --help", async () => {
  const results: any = await Promise.all([
    cli(["download", "--help"]),
    cli(["d", "-h"]),
  ]);

  results.forEach(result => {
    const hasProvidersSection = result.match(/PROVIDERS/);
    expect(hasProvidersSection).toBeTruthy();
    const hasSubcommandsSections = result.match(/SUBCOMMANDS/);
    expect(hasSubcommandsSections).toBeFalsy();

    const hasOutFlag = result.match(/--out/);
    expect(hasOutFlag).toBeTruthy();
  });
});
test("list --help", async () => {
  const results: any = await Promise.all([
    cli(["list", "--help"]),
    cli(["l", "-h"]),
  ]);

  results.forEach(result => {
    const hasSubcommandsSections = result.match(/SUBCOMMANDS/);
    expect(hasSubcommandsSections).toBeTruthy();
  });
});
test("update --help", async () => {
  const results: any = await Promise.all([
    cli(["update", "--help"]),
    cli(["u", "-h"]),
  ]);

  results.forEach(result => {
    const hasSubcommandsSections = result.match(/SUBCOMMANDS/);
    expect(hasSubcommandsSections).toBeTruthy();
  });
});
