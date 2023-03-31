import ts from "typescript";
import type { OpenAPIV3 } from "openapi-types";
import SwaggerParser from "swagger-parser";
import {
  capitalizeFirstLetter,
  normalizeOperationId,
  createParams,
} from "../common/util";
import { RAPINI_MUTATION_ID } from "./rapini-mutation";

export function makeMutations(
  paths: OpenAPIV3.PathsObject,
  $refs?: SwaggerParser.$Refs
) {
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
      /*typeName*/ ts.factory.createIdentifier("Requests"),
      /*typeArgs*/ undefined
    ),
    /*initializer*/ undefined
  );

  const configParam = ts.factory.createParameterDeclaration(
    /*decorators*/ undefined,
    /*modifiers*/ undefined,
    /*dotDotDotToken*/ undefined,
    /*name*/ ts.factory.createIdentifier("config"),
    /*questionToken*/ ts.factory.createToken(ts.SyntaxKind.QuestionToken),
    /*type*/ ts.factory.createIndexedAccessTypeNode(
      /*objectType*/ ts.factory.createTypeReferenceNode(
        /*typeName*/ ts.factory.createIdentifier("Config"),
        /*typeArgs*/ undefined
      ),
      /*indexType*/ ts.factory.createLiteralTypeNode(
        ts.factory.createStringLiteral("mutations")
      )
    ),
    /*initializer*/ undefined
  );

  return [
    ts.factory.createTypeAliasDeclaration(
      /*decorators*/ undefined,
      /*modifiers*/ undefined,
      /*name*/ ts.factory.createIdentifier("MutationConfigs"),
      /*typeParameters*/ undefined,
      /*type*/ ts.factory.createTypeLiteralNode(properties.map((p) => p.config))
    ),
    ts.factory.createFunctionDeclaration(
      /*decorators*/ undefined,
      /*modifiers*/ undefined,
      /*asteriskToken*/ undefined,
      /*name*/ ts.factory.createIdentifier("makeMutations"),
      /*typeParameters*/ undefined,
      /*parameters*/ [requestsParam, configParam],
      /*type*/ undefined,
      /*body*/ ts.factory.createBlock(
        [
          ts.factory.createReturnStatement(
            ts.factory.createAsExpression(
              /*expression*/ ts.factory.createObjectLiteralExpression(
                properties.map((p) => p.property),
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
    ),
  ];
}

// Every path can have multiple mutations, like POST/PUT/PATCH/DELETE etc
// And if there's a GET too then we should invalidate that cache
function makeProperties(pattern: string, path: OpenAPIV3.PathItemObject) {
  const properties: {
    property: ts.PropertyAssignment;
    config: ts.TypeElement;
  }[] = [];
  const pathParams = path.parameters;

  if (path.post) {
    properties.push(makeProperty(pattern, path.post, "post", pathParams));
  }

  if (path.put) {
    properties.push(makeProperty(pattern, path.put, "put", pathParams));
  }

  if (path.patch) {
    properties.push(makeProperty(pattern, path.patch, "patch", pathParams));
  }

  if (path.delete) {
    properties.push(makeProperty(pattern, path.delete, "delete", pathParams));
  }

  return properties;
}

function optionsParameterDeclaration(
  requestIdentifier: string,
  hasRequestBody: boolean
) {
  return ts.factory.createParameterDeclaration(
    /*decorators*/ undefined,
    /*modifiers*/ undefined,
    /*dotDotDotToken*/ undefined,
    /*name*/ ts.factory.createIdentifier("options"),
    /*questionToken*/ ts.factory.createToken(ts.SyntaxKind.QuestionToken),
    /*type*/ ts.factory.createTypeReferenceNode(
      /*typeName*/ ts.factory.createIdentifier("Omit"),
      /*typeArguments*/ [
        ts.factory.createTypeReferenceNode(
          /*typeName*/ ts.factory.createIdentifier("UseMutationOptions"),
          /*typeArguments*/ [
            ts.factory.createTypeReferenceNode(
              /*typeName*/ ts.factory.createIdentifier("Awaited"),
              /*typeArguments*/ [
                ts.factory.createTypeReferenceNode(
                  /*typeName*/ ts.factory.createIdentifier("ReturnType"),
                  /*typeArguments*/ [
                    ts.factory.createTypeQueryNode(
                      /*expressionName*/ ts.factory.createQualifiedName(
                        /*left*/ ts.factory.createIdentifier("requests"),
                        /*right*/ ts.factory.createIdentifier(requestIdentifier)
                      )
                    ),
                  ]
                ),
              ]
            ),
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
            hasRequestBody
              ? ts.factory.createIndexedAccessTypeNode(
                  /*objectType*/ ts.factory.createTypeReferenceNode(
                    /*typeName*/ ts.factory.createIdentifier("Parameters"),
                    /*typeArguments*/ [
                      ts.factory.createTypeQueryNode(
                        /*expressionName*/ ts.factory.createQualifiedName(
                          /*left*/ ts.factory.createIdentifier("requests"),
                          /*right*/ ts.factory.createIdentifier(
                            requestIdentifier
                          )
                        )
                      ),
                    ]
                  ),
                  /*indexType*/ ts.factory.createLiteralTypeNode(
                    /*literal*/ ts.factory.createNumericLiteral(
                      /*value*/ "0",
                      /*numericLiteralFlags*/ undefined
                    )
                  )
                )
              : ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
          ]
        ),
        ts.factory.createLiteralTypeNode(
          /*literal*/ ts.factory.createStringLiteral("mutationFn")
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
  pathParams?: OpenAPIV3.PathItemObject["parameters"]
): { property: ts.PropertyAssignment; config: ts.TypeElement } {
  const operationId = operation.operationId;
  if (!operationId) {
    throw `Missing "operationId" from "${method}" request with pattern ${pattern}`;
  }
  const normalizedOperationId = normalizeOperationId(operationId);

  const identifier = `use${capitalizeFirstLetter(normalizedOperationId)}`;
  const params = createParams(operation, pathParams);

  const hasRequestBody = !!operation.requestBody;

  const body = /*expression*/ ts.factory.createCallExpression(
    /*expression*/ ts.factory.createIdentifier(RAPINI_MUTATION_ID),
    /*typeArguments*/ [
      ts.factory.createTypeReferenceNode(
        /*typeName*/ ts.factory.createIdentifier("Awaited"),
        /*typeArgs*/ [
          ts.factory.createTypeReferenceNode(
            /*typeName*/ ts.factory.createIdentifier("ReturnType"),
            /*typeArgs*/ [
              ts.factory.createTypeQueryNode(
                /*expressionName*/ ts.factory.createQualifiedName(
                  /*left*/ ts.factory.createIdentifier("requests"),
                  /*right*/ ts.factory.createIdentifier(normalizedOperationId)
                )
              ),
            ]
          ),
        ]
      ),
      ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
      hasRequestBody
        ? ts.factory.createIndexedAccessTypeNode(
            /*objectType*/ ts.factory.createTypeReferenceNode(
              /*typeName*/ ts.factory.createIdentifier("Parameters"),
              /*typeArguments*/ [
                ts.factory.createTypeQueryNode(
                  /*expressionName*/ ts.factory.createQualifiedName(
                    /*left*/ ts.factory.createIdentifier("requests"),
                    /*right*/ ts.factory.createIdentifier(normalizedOperationId)
                  )
                ),
              ]
            ),
            /*indexType*/ ts.factory.createLiteralTypeNode(
              /*literal*/ ts.factory.createNumericLiteral(
                /*value*/ "0",
                /*numericLiteralFlags*/ undefined
              )
            )
          )
        : ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
    ],
    /*args*/ [
      ts.factory.createArrowFunction(
        /*modifiers*/ undefined,
        /*typeParameters*/ undefined,
        /*parameters*/ hasRequestBody
          ? [
              ts.factory.createParameterDeclaration(
                /*decorators*/ undefined,
                /*modifiers*/ undefined,
                /*dotDotDotToken*/ undefined,
                /*name*/ ts.factory.createIdentifier("payload"),
                /*questionToken*/ undefined,
                /*type*/ undefined,
                /*initializer*/ undefined
              ),
            ]
          : [],
        /*type*/ undefined,
        /*equalsGreaterThanToken*/ ts.factory.createToken(
          ts.SyntaxKind.EqualsGreaterThanToken
        ),
        /*body*/ ts.factory.createCallExpression(
          /*expression*/ ts.factory.createPropertyAccessExpression(
            /*expression*/ ts.factory.createIdentifier("requests"),
            /*name*/ ts.factory.createIdentifier(normalizedOperationId)
          ),
          /*typeArguments*/ undefined,
          /*args*/ hasRequestBody
            ? [
                ts.factory.createIdentifier("payload"),
                ...params.map((p) => p.name),
              ]
            : params.map((p) => p.name)
        )
      ),
      ts.factory.createPropertyAccessChain(
        /*expression*/ ts.factory.createIdentifier("config"),
        /*questionDotToken*/ ts.factory.createToken(
          ts.SyntaxKind.QuestionDotToken
        ),
        /*name*/ ts.factory.createIdentifier(identifier)
      ),
      ts.factory.createIdentifier("options"),
    ]
  );

  return {
    property: ts.factory.createPropertyAssignment(
      /*name*/ ts.factory.createIdentifier(identifier),
      /*initializer*/ ts.factory.createArrowFunction(
        /*modifiers*/ undefined,
        /*typeParameters*/ undefined,
        /*parameters*/ [
          ...params.map((p) => p.arrowFuncParam),
          optionsParameterDeclaration(normalizedOperationId, hasRequestBody),
        ],
        /*type*/ undefined,
        /*equalsGreaterThanToken*/ ts.factory.createToken(
          ts.SyntaxKind.EqualsGreaterThanToken
        ),
        /*body*/ body
      )
    ),
    config: ts.factory.createPropertySignature(
      undefined,
      ts.factory.createIdentifier(identifier),
      ts.factory.createToken(ts.SyntaxKind.QuestionToken),
      ts.factory.createFunctionTypeNode(
        undefined,
        [
          ts.factory.createParameterDeclaration(
            undefined,
            undefined,
            undefined,
            ts.factory.createIdentifier("queryClient"),
            undefined,
            ts.factory.createTypeReferenceNode(
              ts.factory.createIdentifier("QueryClient"),
              undefined
            ),
            undefined
          ),
        ],
        ts.factory.createTypeReferenceNode(
          ts.factory.createIdentifier("Pick"),
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
                        ts.factory.createIndexedAccessTypeNode(
                          ts.factory.createTypeReferenceNode(
                            ts.factory.createIdentifier("Requests"),
                            undefined
                          ),
                          ts.factory.createLiteralTypeNode(
                            ts.factory.createStringLiteral(
                              normalizedOperationId
                            )
                          )
                        ),
                      ]
                    ),
                  ]
                ),
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
                hasRequestBody
                  ? ts.factory.createIndexedAccessTypeNode(
                      ts.factory.createTypeReferenceNode(
                        ts.factory.createIdentifier("Parameters"),
                        [
                          ts.factory.createIndexedAccessTypeNode(
                            ts.factory.createTypeReferenceNode(
                              ts.factory.createIdentifier("Requests"),
                              undefined
                            ),
                            ts.factory.createLiteralTypeNode(
                              ts.factory.createStringLiteral(
                                normalizedOperationId
                              )
                            )
                          ),
                        ]
                      ),
                      ts.factory.createLiteralTypeNode(
                        ts.factory.createNumericLiteral("0")
                      )
                    )
                  : ts.factory.createKeywordTypeNode(
                      ts.SyntaxKind.UnknownKeyword
                    ),
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
              ]
            ),
            ts.factory.createUnionTypeNode([
              ts.factory.createLiteralTypeNode(
                ts.factory.createStringLiteral("onSuccess")
              ),
              ts.factory.createLiteralTypeNode(
                ts.factory.createStringLiteral("onSettled")
              ),
              ts.factory.createLiteralTypeNode(
                ts.factory.createStringLiteral("onError")
              ),
            ]),
          ]
        )
      )
    ),
  };
}
