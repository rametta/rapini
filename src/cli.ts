#!/usr/bin/env node
import { generate } from "./generator";
import { Command } from "commander";

export type CLIOptions = {
  name: string;
  packageVersion: string;
  outputDir: string;
  path: string;
  baseUrl: string;
  replacer: string[];
};

const program = new Command();

program
  .version("1.7.0")
  .description("Generate a package based on OpenAPI")
  .requiredOption("-p, --path <path>", "Path to OpenAPI file")
  .option(
    "-n, --name [name]",
    "Name to use for the generated package",
    "rapini-generated-package"
  )
  .option(
    "-pv, --package-version [version]",
    "Semver version to use for the generated package",
    "1.0.0"
  )
  .option(
    "-o, --output-dir [directory]",
    "Directory to output the generated package",
    "rapini-generated-package"
  )
  .option("-b, --base-url [url]", "Prefix every request with this url")
  .option(
    "-r, --replacer [oldString] [newString...]",
    "Replace part(s) of any route's path with simple string replacements. Ex: `-r /api/v1 /api/v2` would replace the v1 with v2 in every route"
  )
  .parse();

const options = program.opts<CLIOptions>();

console.log(`Generating package using OpenApi file ${options.path}`);
generate(options);
