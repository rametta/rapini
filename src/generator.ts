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

function isOpenApiV3Document(doc: OpenAPI.Document): doc is OpenAPIV3.Document {
  return "openapi" in doc;
}

function parse(doc: OpenAPI.Document) {
  if (isOpenApiV3Document(doc)) {
    return parseOpenApiV3Doc(doc);
  }

  throw "OpenAPI Document version not supported";
}

function parseOpenApiV3Doc(doc: OpenAPIV3.Document) {
  return {
    queryIds: makeQueryIds(doc.paths),
    requests: makeRequests(doc.paths),
    queries: makeQueries(doc.paths),
    mutations: makeMutations(doc.paths),
  };
}

function makeSourceFile(data: ReturnType<typeof parse>) {
  return ts.factory.createSourceFile(
    /*statements*/ [
      ...makeImports(),
      // ADD TYPES HERE
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

export function generate(pathToOpenApiV3: string) {
  SwaggerParser.validate(pathToOpenApiV3, (err, api) => {
    if (err) {
      console.error(err);
      return;
    }

    console.log("API name: %s, Version: %s", api.info.title, api.info.version);
    const data = parse(api);

    const source = makeSource(data);
    print(source);
  });
}
