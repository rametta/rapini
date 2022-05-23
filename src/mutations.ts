import ts from "typescript";
import type { OpenAPIV3 } from "openapi-types";
import {
  capitalizeFirstLetter,
  isRequestBodyObject,
  isSchemaObject,
  schemaObjectTypeToTS,
  toParamObjects,
} from "./common";

export function makeMutations(paths: OpenAPIV3.PathsObject) {
  const properties = Object.entries(paths).flatMap(([pattern, path]) =>
    makeProperties(pattern, path)
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

  const queryIdsParam = ts.factory.createParameterDeclaration(
    /*decorators*/ undefined,
    /*modifiers*/ undefined,
    /*dotDotDotToken*/ undefined,
    /*name*/ ts.factory.createIdentifier("queryIds"),
    /*questionToken*/ undefined,
    /*type*/ ts.factory.createTypeReferenceNode(
      /*typeName*/ ts.factory.createIdentifier("ReturnType"),
      /*typeArgs*/ [
        ts.factory.createTypeQueryNode(
          /*exprName*/ ts.factory.createIdentifier("makeQueryIds")
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
    /*parameters*/ [requestsParam, queryIdsParam],
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

// Generates: `const queryClient = useQueryClient();`
function useQueryClientStatement() {
  return ts.factory.createVariableStatement(
    /*modifiers*/ undefined,
    /*declarationList*/ ts.factory.createVariableDeclarationList(
      /*declarations*/ [
        ts.factory.createVariableDeclaration(
          /*name*/ ts.factory.createIdentifier("queryClient"),
          /*exclamationToken*/ undefined,
          /*type*/ undefined,
          /*initializer*/ ts.factory.createCallExpression(
            /*expression*/ ts.factory.createIdentifier("useQueryClient"),
            /*typeArgs*/ undefined,
            /*args*/ []
          )
        ),
      ],
      /*flags*/ ts.NodeFlags.Const
    )
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

  const identifier = `use${capitalizeFirstLetter(operation.operationId)}`;
  const params = createParams(operation);

  const hasRequestBody = !!operation.requestBody;

  const onSuccessStatements = get
    ? [
        ts.factory.createExpressionStatement(
          ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(
              ts.factory.createIdentifier("queryClient"),
              ts.factory.createIdentifier("setQueryData")
            ),
            undefined,
            [
              ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(
                  ts.factory.createIdentifier("queryIds"),
                  ts.factory.createIdentifier(get.operationId)
                ),
                undefined,
                [ts.factory.createIdentifier("TODO")]
              ),
              ts.factory.createIdentifier("response"),
            ]
          )
        ),
        ts.factory.createExpressionStatement(
          ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(
              ts.factory.createIdentifier("queryClient"),
              ts.factory.createIdentifier("invalidateQueries")
            ),
            undefined,
            [
              ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(
                  ts.factory.createIdentifier("queryIds"),
                  ts.factory.createIdentifier(get.operationId)
                ),
                undefined,
                [ts.factory.createIdentifier("TODO")]
              ),
            ]
          )
        ),
      ]
    : [];

  return ts.factory.createPropertyAssignment(
    /*name*/ ts.factory.createIdentifier(identifier),
    /*initializer*/ ts.factory.createArrowFunction(
      /*modifiers*/ undefined,
      /*typeParameters*/ undefined,
      /*parameters*/ params.map((p) => p.arrowFuncParam),
      /*type*/ undefined,
      /*equalsGreaterThanToken*/ ts.factory.createToken(
        ts.SyntaxKind.EqualsGreaterThanToken
      ),
      /*body*/ ts.factory.createBlock(
        /*statements*/ [
          useQueryClientStatement(),
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
                            ts.factory.createIdentifier(operation.operationId)
                          )
                        ),
                      ]
                    ),
                  ]
                ),
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
                ts.factory.createTypeReferenceNode(
                  ts.factory.createIdentifier("TODO"),
                  undefined
                ),
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
                      ts.factory.createIdentifier(operation.operationId)
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
                ts.factory.createObjectLiteralExpression(
                  [
                    ts.factory.createPropertyAssignment(
                      ts.factory.createIdentifier("onSuccess"),
                      ts.factory.createArrowFunction(
                        undefined,
                        undefined,
                        [
                          ts.factory.createParameterDeclaration(
                            undefined,
                            undefined,
                            undefined,
                            ts.factory.createIdentifier("response"),
                            undefined,
                            undefined,
                            undefined
                          ),
                        ],
                        undefined,
                        ts.factory.createToken(
                          ts.SyntaxKind.EqualsGreaterThanToken
                        ),
                        ts.factory.createBlock(
                          /*statements*/ onSuccessStatements,
                          /*multiline*/ true
                        )
                      )
                    ),
                  ],
                  true
                ),
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
