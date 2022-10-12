import ts from "typescript";
import type { OpenAPI, OpenAPIV3 } from "openapi-types";
import SwaggerParser from "@apidevtools/swagger-parser";
import { isOpenApiV3Document } from "../common/util";
import { makeQueryIds } from "../common/queryIds";
import { makeRequests } from "../common/requests";
import { makeTypes } from "../common/types";
import { print } from "./print";
import { makeImports } from "./imports";
import { makeQueries } from "./queries";
import { makeInitialize } from "./initialize";
import { makeConfigTypes } from "./config";
import { CLIOptions } from "../cli";

function parse(
  doc: OpenAPI.Document,
  $refs: SwaggerParser.$Refs,
  options: CLIOptions
) {
  if (isOpenApiV3Document(doc)) {
    return parseOpenApiV3Doc(doc, $refs, options);
  }

  throw "OpenAPI Document version not supported";
}

function parseOpenApiV3Doc(
  doc: OpenAPIV3.Document,
  $refs: SwaggerParser.$Refs,
  options: CLIOptions
) {
  return {
    imports: makeImports(),
    queryIds: makeQueryIds(doc.paths),
    requests: makeRequests(doc.paths, $refs, options),
    queries: makeQueries(doc.paths),
    types: makeTypes(doc),
  };
}

function makeSourceFile(data: ReturnType<typeof parse>) {
  return ts.factory.createSourceFile(
    /*statements*/ [
      ...data.imports,
      ...data.types,
      ...makeConfigTypes(),
      makeInitialize(),
      ...data.queryIds,
      data.requests,
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
  const data = parse(api, parser.$refs, options);
  const source = makeSource(data);
  print(source, options);
}
