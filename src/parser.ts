import type { OpenAPI, OpenAPIV2, OpenAPIV3 } from "openapi-types";

// const operationMethods = [
//   "get",
//   "post",
//   "put",
//   "delete",
//   "options",
// ] as const;
// type OperationMethod = typeof operationMethods[number];

function isOpenApiV3Document(doc: OpenAPI.Document): doc is OpenAPIV3.Document {
  return "openapi" in doc;
}

// function isOpenApiComplexType(schema: OpenAPIV3.SchemaObject) {
//   return (
//     schema.allOf ||
//     schema.anyOf ||
//     schema.oneOf ||
//     schema.type === "array" ||
//     schema.type === "object"
//   );
// }

export function parse(doc: OpenAPI.Document) {
  if (isOpenApiV3Document(doc)) {
    return parseOpenApiV3Doc(doc);
  }

  throw "OpenAPI Document version not supported";
}

function parseOpenApiV3Doc(doc: OpenAPIV3.Document) {
  return Object.entries(doc.paths).map(([path, item]) => item.get.parameters);
}
