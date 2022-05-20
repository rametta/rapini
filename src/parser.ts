import type { OpenAPI, OpenAPIV3 } from "openapi-types";
import ts from "typescript";
import type { AxiosRequestConfig } from "axios";

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
    .filter(([_, item]) => !!item.get)
    .map(([pattern, item]) => makeQueryId(pattern, item.get));

  const requests = Object.entries(doc.paths).flatMap(([pattern, item]) =>
    makeRequests(pattern, item)
  );

  return {
    queryIds,
    requests,
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

// queryIds's are only made for GET's
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

// Match everything inside of curly braces
// Ex: /api/pet/{petId} -> would match {petId}
const patternRegex = /({.+?})/;

// Match all braces, like { or }
const bracesRegex = /{|}/g;

function patternToPath(pattern: string) {
  const splits = pattern.split(patternRegex);
  const [head, ...tail] = splits;

  if (tail.length === 0) {
    return ts.factory.createNoSubstitutionTemplateLiteral(head, head);
  }

  const chunks: string[][] = [];
  const chunkSize = 2;
  for (let i = 0; i < tail.length; i += chunkSize) {
    const chunk = tail.slice(i, i + chunkSize);
    chunks.push(chunk);
  }

  const headTemplate = ts.factory.createTemplateHead(head, head);

  const middleTemplates = chunks.map(([name, path], index) =>
    ts.factory.createTemplateSpan(
      ts.factory.createIdentifier(name.replace(bracesRegex, "")),
      index === chunks.length - 1
        ? ts.factory.createTemplateTail(path, path)
        : ts.factory.createTemplateMiddle(path, path)
    )
  );

  return ts.factory.createTemplateExpression(headTemplate, middleTemplates);
}

function makeRequests(pattern: string, item: OpenAPIV3.PathItemObject) {
  const requests: ts.PropertyAssignment[] = [];

  if (item.get) {
    requests.push(makeRequest(pattern, "get", item.get));
  }
  if (item.delete) {
    requests.push(makeRequest(pattern, "delete", item.delete));
  }
  if (item.post) {
    requests.push(makeRequest(pattern, "post", item.post));
  }
  if (item.put) {
    requests.push(makeRequest(pattern, "put", item.put));
  }
  if (item.patch) {
    requests.push(makeRequest(pattern, "patch", item.patch));
  }
  if (item.head) {
    requests.push(makeRequest(pattern, "head", item.head));
  }
  if (item.options) {
    requests.push(makeRequest(pattern, "options", item.options));
  }

  return requests;
}

function makeRequest(
  pattern: string,
  method: string,
  item: OpenAPIV3.OperationObject
) {
  const pathTemplateExpression = patternToPath(pattern);

  return ts.factory.createPropertyAssignment(
    ts.factory.createIdentifier(item.operationId),
    ts.factory.createArrowFunction(
      /*modifiers*/ undefined,
      /*typeParams*/ undefined,
      /*params*/ [
        // TODO THIS ARRAY
        ts.factory.createParameterDeclaration(
          undefined,
          undefined,
          undefined,
          ts.factory.createIdentifier("customerId"),
          undefined,
          ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
          undefined
        ),
      ],
      /*type*/ undefined,
      /*equalsGreaterThanToken*/ ts.factory.createToken(
        ts.SyntaxKind.EqualsGreaterThanToken
      ),
      /*body*/
      ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(
          ts.factory.createCallExpression(
            /*expression*/ ts.factory.createPropertyAccessExpression(
              ts.factory.createIdentifier("axios"),
              ts.factory.createIdentifier("request")
            ),
            /*typeArgs*/ [
              ts.factory.createTypeReferenceNode(
                /*typeName*/ ts.factory.createIdentifier("Pet"), // TODO replace with real type
                /*typeArgs*/ undefined
              ),
            ],
            /*args*/ [
              ts.factory.createObjectLiteralExpression(
                [
                  ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier("method"),
                    ts.factory.createStringLiteral(method)
                  ),
                  ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier("url"),
                    pathTemplateExpression
                  ),
                  ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier("params"),
                    ts.factory.createObjectLiteralExpression(
                      [
                        ts.factory.createPropertyAssignment(
                          ts.factory.createIdentifier("field"),
                          ts.factory.createIdentifier("value")
                        ),
                        ts.factory.createPropertyAssignment(
                          ts.factory.createIdentifier("field2"),
                          ts.factory.createIdentifier("value2")
                        ),
                      ],
                      true
                    )
                  ),
                  ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier("data"),
                    ts.factory.createObjectLiteralExpression(
                      [
                        ts.factory.createPropertyAssignment(
                          ts.factory.createIdentifier("field2"),
                          ts.factory.createIdentifier("value2")
                        ),
                        ts.factory.createPropertyAssignment(
                          ts.factory.createIdentifier("field3"),
                          ts.factory.createIdentifier("value3")
                        ),
                      ],
                      true
                    )
                  ),
                ],
                true
              ),
            ]
          ),
          ts.factory.createIdentifier("then")
        ),
        undefined,
        [
          ts.factory.createArrowFunction(
            undefined,
            undefined,
            [
              ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                undefined,
                ts.factory.createIdentifier("res"),
                undefined,
                undefined,
                undefined
              ),
            ],
            undefined,
            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
            ts.factory.createPropertyAccessExpression(
              ts.factory.createIdentifier("res"),
              ts.factory.createIdentifier("data")
            )
          ),
        ]
      )
    )
  );
}
