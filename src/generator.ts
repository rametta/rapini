import ts from "typescript";
import type { OpenAPI, OpenAPIV3 } from "openapi-types";
import SwaggerParser from "@apidevtools/swagger-parser";
import { print } from "./print";
import { makeImports } from "./imports";
import { makeQueryIds } from "./queryIds";
import { makeRequests } from "./requests";
import { makeQueries } from "./queries";
import { makeInitialize } from "./initialize";
import { makeMutations } from "./mutations";
import { makeTypes } from "./types";
import { CLIOptions } from "./cli";

function isOpenApiV3Document(doc: OpenAPI.Document): doc is OpenAPIV3.Document {
  return "openapi" in doc;
}

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
    queryIds: makeQueryIds(doc.paths),
    requests: makeRequests(doc.paths, $refs, options),
    queries: makeQueries(doc.paths, $refs),
    mutations: makeMutations(doc.paths, $refs),
    types: makeTypes(doc),
  };
}

function makeSourceFile(data: ReturnType<typeof parse>) {
  const types = data.types ? data.types : [];
  return ts.factory.createSourceFile(
    /*statements*/ [
      ...makeImports(),
      ...types,
      makeInitialize(),
      data.queryIds,
      data.requests,
      data.queries,
      data.mutations,
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
  const api = await parser.parse(options.path);

  console.log("API name: %s, Version: %s", api.info.title, api.info.version);
  const data = parse(api, parser.$refs, options);
  const source = makeSource(data);
  print(source, options);
}
