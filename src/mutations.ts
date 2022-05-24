import ts from "typescript";
import type { OpenAPIV3 } from "openapi-types";
import {
  capitalizeFirstLetter,
  isSchemaObject,
  schemaObjectTypeToTS,
  toParamObjects,
} from "./common";

export function makeMutations(paths: OpenAPIV3.PathsObject) {
  const properties = Object.entries(paths).flatMap(([pattern, path]) =>
    makeProperties(pattern, path!)
  );

  const requestsParam = ts.factory.createParameterDeclaration(
    /*decorators*/ undefined,
    /*modifiers*/ undefined,
    /*dotDotDotToken*/ undefined,
    /*name*/ ts.factory.createIdentifier("requests"),
    /*questionToken*/ undefined,
    /*type*/ ts.factory.createTypeReferenceNode(
      /*typeName*/ ts.factory.createIdentifier("ReturnType"),
      /*typeArgs*/ [
        ts.factory.createTypeQueryNode(
          /*exprName*/ ts.factory.createIdentifier("makeRequests")
        ),
      ]
    ),
    /*initializer*/ undefined
  );

  return ts.factory.createFunctionDeclaration(
    /*decorators*/ undefined,
    /*modifiers*/ undefined,
    /*asteriskToken*/ undefined,
    /*name*/ ts.factory.createIdentifier("makeMutations"),
    /*typeParameters*/ undefined,
    /*parameters*/ [requestsParam],
    /*type*/ undefined,
    /*body*/ ts.factory.createBlock(
      [
        ts.factory.createReturnStatement(
          ts.factory.createAsExpression(
            /*expression*/ ts.factory.createObjectLiteralExpression(
              properties,
              /*multiline*/ true
            ),
            /*type*/ ts.factory.createTypeReferenceNode(
              /*typeName*/ ts.factory.createIdentifier("const"),
              /*typeArgs*/ undefined
            )
          )
        ),
      ],
      /*multiline*/ true
    )
  );
}

// Every path can have multiple mutations, like POST/PUT/PATCH/DELETE etc
// And if there's a GET too then we should invalidate that cache
function makeProperties(pattern: string, path: OpenAPIV3.PathItemObject) {
  const properties: ts.PropertyAssignment[] = [];

  if (path.post) {
    properties.push(makeProperty(pattern, path.post, "post", path.get));
  }

  if (path.put) {
    properties.push(makeProperty(pattern, path.put, "put", path.get));
  }

  if (path.patch) {
    properties.push(makeProperty(pattern, path.patch, "patch", path.get));
  }

  if (path.delete) {
    properties.push(makeProperty(pattern, path.delete, "delete", path.get));
  }

  return properties;
}

function optionsParameterDeclaration(requestIdentifier: string) {
  return ts.factory.createParameterDeclaration(
    /*decorators*/ undefined,
    /*modifiers*/ undefined,
    /*dotDotDotToken*/ undefined,
    /*name*/ ts.factory.createIdentifier("options"),
    /*questionToken*/ ts.factory.createToken(ts.SyntaxKind.QuestionToken),
    /*type*/ ts.factory.createTypeReferenceNode(
      ts.factory.createIdentifier("Omit"),
      [
        ts.factory.createTypeReferenceNode(
          ts.factory.createIdentifier("UseMutationOptions"),
          [
            ts.factory.createTypeReferenceNode(
              ts.factory.createIdentifier("Awaited"),
              [
                ts.factory.createTypeReferenceNode(
                  ts.factory.createIdentifier("ReturnType"),
                  [
                    ts.factory.createTypeQueryNode(
                      ts.factory.createQualifiedName(
                        ts.factory.createIdentifier("requests"),
                        ts.factory.createIdentifier(requestIdentifier)
                      )
                    ),
                  ]
                ),
              ]
            ),
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
          ]
        ),
        ts.factory.createLiteralTypeNode(
          ts.factory.createStringLiteral("mutationFn")
        ),
      ]
    ),
    /*initializer*/ undefined
  );
}

function makeProperty(
  pattern: string,
  operation: OpenAPIV3.OperationObject,
  method: string,
  get?: OpenAPIV3.PathItemObject["get"]
) {
  const operationId = operation.operationId;
  if (!operationId) {
    throw `Missing "operationId" from "${method}" request with pattern ${pattern}`;
  }

  const identifier = `use${capitalizeFirstLetter(operationId)}`;
  const params = createParams(operation);

  const hasRequestBody = !!operation.requestBody;

  return ts.factory.createPropertyAssignment(
    /*name*/ ts.factory.createIdentifier(identifier),
    /*initializer*/ ts.factory.createArrowFunction(
      /*modifiers*/ undefined,
      /*typeParameters*/ undefined,
      /*parameters*/ [
        ...params.map((p) => p.arrowFuncParam),
        optionsParameterDeclaration(operationId),
      ],
      /*type*/ undefined,
      /*equalsGreaterThanToken*/ ts.factory.createToken(
        ts.SyntaxKind.EqualsGreaterThanToken
      ),
      /*body*/ ts.factory.createBlock(
        /*statements*/ [
          ts.factory.createReturnStatement(
            ts.factory.createCallExpression(
              ts.factory.createIdentifier("useMutation"),
              [
                ts.factory.createTypeReferenceNode(
                  ts.factory.createIdentifier("Awaited"),
                  [
                    ts.factory.createTypeReferenceNode(
                      ts.factory.createIdentifier("ReturnType"),
                      [
                        ts.factory.createTypeQueryNode(
                          ts.factory.createQualifiedName(
                            ts.factory.createIdentifier("requests"),
                            ts.factory.createIdentifier(operationId)
                          )
                        ),
                      ]
                    ),
                  ]
                ),
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
              ],
              [
                ts.factory.createArrowFunction(
                  undefined,
                  undefined,
                  hasRequestBody
                    ? [
                        ts.factory.createParameterDeclaration(
                          undefined,
                          undefined,
                          undefined,
                          ts.factory.createIdentifier("payload"),
                          undefined,
                          undefined,
                          undefined
                        ),
                      ]
                    : [],
                  undefined,
                  ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                  ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                      ts.factory.createIdentifier("requests"),
                      ts.factory.createIdentifier(operationId)
                    ),
                    undefined,
                    hasRequestBody
                      ? [
                          ts.factory.createIdentifier("payload"),
                          ...params.map((p) => p.name),
                        ]
                      : params.map((p) => p.name)
                  )
                ),
                ts.factory.createIdentifier("options"),
              ]
            )
          ),
        ],
        /*multiline*/ true
      )
    )
  );
}

function createParams(item: OpenAPIV3.OperationObject) {
  if (!item.parameters) {
    return [];
  }

  const paramObjects = toParamObjects(item.parameters);

  return paramObjects
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
}
