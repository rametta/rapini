#!/usr/bin/env node
import { generate as generateReactQuery } from "./react-query/generator";
import { generate as generateSWR } from "./swr/generator";
import { Argument, Command, Option } from "commander";

export type CLIOptions = {
  name: string;
  packageVersion: string;
  outputDir: string;
  path: string;
  baseUrl: string;
  replacer: string[];
  reactQueryVersion: "v3" | "v4" | "v5";
};

const program = new Command();

const sharedOptions = [
  new Option("-p, --path <path>", "Path to OpenAPI file"),
  new Option(
    "-n, --name [name]",
    "Name to use for the generated package"
  ).default("rapini-generated-package"),
  new Option(
    "-pv, --package-version [version]",
    "Semver version to use for the generated package"
  ).default("1.0.0"),
  new Option(
    "-o, --output-dir [directory]",
    "Directory to output the generated package"
  ).default("rapini-generated-package"),
  new Option("-b, --base-url [url]", "Prefix every request with this url"),
  new Option(
    "-r, --replacer [oldString] [newString...]",
    "Replace part(s) of any route's path with simple string replacements. Ex: `-r /api/v1 /api/v2` would replace the v1 with v2 in every route"
  ),
];

let rqCommand = new Command("react-query")
  .description("Generate a Package for TanStack React Query")
  .addArgument(
    new Argument("[version]")
      .choices(["v3", "v4", "v5"])
      .default("v3", "React Query V3 is the default version")
  )
  .action((version, options) => {
    console.log(
      `Generating React Query ${version} package using OpenAPI file ${options.path}`
    );
    options.reactQueryVersion = version;
    generateReactQuery(options);
  });

let swrComamnd = new Command("swr")
  .description("Generate a Package for SWR (stale-while-revalidate)")
  .action((options) => {
    console.log(`Generating SWR package using OpenAPI file ${options.path}`);
    generateSWR(options);
  });

sharedOptions.forEach((option) => {
  rqCommand = rqCommand.addOption(option);
  swrComamnd = swrComamnd.addOption(option);
});

program
  .name("rapini")
  .description("Generate a package based on OpenAPI")
  .version("3.5.0")
  .addCommand(rqCommand)
  .addCommand(swrComamnd);

program.parse();
