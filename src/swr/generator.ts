import ts from "typescript";
import type { OpenAPI, OpenAPIV3 } from "openapi-types";
import SwaggerParser from "@apidevtools/swagger-parser";
import { isOpenApiV3Document } from "../common/util";
import { makeQueryKeys } from "../common/queryKeys";
import { makeRequests } from "../common/requests";
import { makeTypes } from "../common/types";
import { print } from "./print";
import { makeImports } from "./imports";
import { makeQueries } from "./queries";
import { makeInitialize } from "./initialize";
import { makeConfigTypes } from "./config";
import { CLIOptions } from "../cli";

function parse(
  $refs: SwaggerParser.$Refs,
  doc: OpenAPI.Document,
  options: CLIOptions
) {
  if (isOpenApiV3Document(doc)) {
    return parseOpenApiV3Doc($refs, doc, options);
  }

  throw "OpenAPI Document version not supported";
}

function parseOpenApiV3Doc(
  $refs: SwaggerParser.$Refs,
  doc: OpenAPIV3.Document,
  options: CLIOptions
) {
  return {
    imports: makeImports(),
    queryKeys: makeQueryKeys($refs, doc.paths),
    requests: makeRequests($refs, doc.paths, options),
    queries: makeQueries($refs, doc.paths),
    types: makeTypes($refs, doc),
  };
}

function makeSourceFile(data: ReturnType<typeof parse>) {
  return ts.factory.createSourceFile(
    /*statements*/ [
      ...data.imports,
      ...data.types,
      ...makeConfigTypes(),
      makeInitialize(),
      ...data.queryKeys,
      ...data.requests,
      data.queries,
    ],
    /*endOfFileToken*/ ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
    /*flags*/ ts.NodeFlags.None
  );
}

function makeSource(data: ReturnType<typeof parse>) {
  const resultFile = ts.createSourceFile(
    "client.ts",
    "",
    ts.ScriptTarget.Latest,
    /*setParentNodes*/ false,
    ts.ScriptKind.TS
  );
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

  const result = printer.printNode(
    ts.EmitHint.Unspecified,
    makeSourceFile(data),
    resultFile
  );

  return result;
}

export async function generate(options: CLIOptions) {
  const parser = new SwaggerParser();
  const api = await parser.bundle(options.path);

  console.log("API name: %s, Version: %s", api.info.title, api.info.version);
  try {
    const data = parse(parser.$refs, api, options);
    const source = makeSource(data);
    print(source, options);
  } catch (e) {
    console.error("Failed to parse API document.", e);
  }
}
