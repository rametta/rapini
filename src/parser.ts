import type { OpenAPI, OpenAPIV3 } from "openapi-types";
import ts from "typescript";

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

function isParameterObject(
  param: OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject
): param is OpenAPIV3.ParameterObject {
  return "name" in param;
}

function isSchemaObject(
  param: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject
): param is OpenAPIV3.SchemaObject {
  return "type" in param;
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
  const queryIds = Object.entries(doc.paths)
    .filter(([pattern, item]) => !!item.get)
    .map(([pattern, item]) => makeQueryId(pattern, item.get));

  return {
    queryIds,
  };
}

function schemaObjectTypeToTS(
  objectType:
    | OpenAPIV3.ArraySchemaObjectType
    | OpenAPIV3.NonArraySchemaObjectType
) {
  switch (objectType) {
    case "string":
      return ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
    case "integer":
    case "number":
      return ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
    case "boolean":
      return ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword);
    case "object":
      return ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
    case "array":
      return ts.factory.createArrayTypeNode(
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
      );
    default:
      return ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
  }
}

function makeQueryId(pattern: string, get: OpenAPIV3.PathItemObject["get"]) {
  if (!get.operationId) {
    throw `Missing "operationId" from "get" request with pattern ${pattern}`;
  }

  const paramObjects =
    get.parameters?.filter(<
      (
        param: OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject
      ) => param is OpenAPIV3.ParameterObject
    >((param) => isParameterObject(param))) ?? [];

  const params = paramObjects
    .sort((x, y) => (x.required === y.required ? 0 : x.required ? -1 : 1)) // put all optional values at the end
    .map((param) => ({
      name: ts.factory.createIdentifier(param.name),
      arrowFuncParam: ts.factory.createParameterDeclaration(
        /*decorators*/ undefined,
        /*modifiers*/ undefined,
        /*dotDotDotToken*/ undefined,
        /*name*/ ts.factory.createIdentifier(param.name),
        /*questionToken*/ param.required
          ? undefined
          : ts.factory.createToken(ts.SyntaxKind.QuestionToken),
        /*type*/ schemaObjectTypeToTS(
          isSchemaObject(param.schema) ? param.schema.type : null
        ),
        /*initializer*/ undefined
      ),
    }));

  return ts.factory.createPropertyAssignment(
    /*name*/ ts.factory.createIdentifier(get.operationId),
    /*initializer*/ ts.factory.createArrowFunction(
      /*modifiers*/ undefined,
      /*typeParams*/ undefined,
      /*parameters*/ params.map((arg) => arg.arrowFuncParam),
      /*type*/ undefined,
      /*equalsGreaterThanToken*/ ts.factory.createToken(
        ts.SyntaxKind.EqualsGreaterThanToken
      ),
      /*body*/ ts.factory.createAsExpression(
        ts.factory.createArrayLiteralExpression(
          [
            ts.factory.createStringLiteral(get.operationId),
            ...params.map((p) => p.name),
          ],
          false
        ),
        ts.factory.createTypeReferenceNode(
          ts.factory.createIdentifier("const"),
          undefined
        )
      )
    )
  );
}

function makeGetRequest(
  pattern: string,
  get: OpenAPIV3.PathItemObject["get"]
) {}

function makeGetQuery(pattern: string, get: OpenAPIV3.PathItemObject["get"]) {}
