import ts from "typescript";
import type { OpenAPIV3 } from "openapi-types";
import SwaggerParser from "swagger-parser";
import {
  capitalizeFirstLetter,
  createParams,
  normalizeOperationId,
} from "./common";

export function makeQueries(
  paths: OpenAPIV3.PathsObject,
  $refs?: SwaggerParser.$Refs
) {
  const properties = Object.entries(paths)
    .filter(([_, item]) => !!item?.get)
    .map(([pattern, item]) => makeProperty(pattern, item!.get));

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
    /*name*/ ts.factory.createIdentifier("makeQueries"),
    /*typeParameters*/ undefined,
    /*parameters*/ [requestsParam, queryIdsParam],
    /*type*/ undefined,
    /*body*/ ts.factory.createBlock(
      [
        ts.factory.createReturnStatement(
          /*expression*/ ts.factory.createAsExpression(
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

function makeProperty(pattern: string, get: OpenAPIV3.PathItemObject["get"]) {
  if (!get?.operationId) {
    throw `Missing "operationId" from "get" request with pattern ${pattern}`;
  }

  const normalizedOperationId = normalizeOperationId(get.operationId);
  const identifierName = `use${capitalizeFirstLetter(normalizedOperationId)}`;

  const params = createParams(get);

  return ts.factory.createPropertyAssignment(
    /*name*/ ts.factory.createIdentifier(identifierName),
    /*initializer*/ ts.factory.createArrowFunction(
      /*modifiers*/ undefined,
      /*typeParams*/ undefined,
      /*params*/ [
        ...params.map((p) => p.arrowFuncParam),
        optionsParameterDeclaration(normalizedOperationId),
      ],
      /*type*/ ts.factory.createTypeReferenceNode(
        ts.factory.createIdentifier("UseQueryResult"),
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
                      ts.factory.createIdentifier(normalizedOperationId)
                    ),
                    undefined
                  ),
                ]
              ),
            ]
          ),
          ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
        ]
      ),
      /*equalsGreaterThanToken*/ ts.factory.createToken(
        ts.SyntaxKind.EqualsGreaterThanToken
      ),
      /*body*/ ts.factory.createCallExpression(
        /*expression*/ ts.factory.createIdentifier("useQuery"),
        /*typeArgs*/ undefined,
        /*args*/ [
          ts.factory.createCallExpression(
            /*expression*/ ts.factory.createPropertyAccessExpression(
              /*expression*/ ts.factory.createIdentifier("queryIds"),
              /*name*/ ts.factory.createIdentifier(normalizedOperationId)
            ),
            /*typeArgs*/ undefined,
            /*args*/ params.map((p) => p.name)
          ),
          ts.factory.createArrowFunction(
            /*modifiers*/ undefined,
            /*typeParameters*/ undefined,
            /*parameters*/ [],
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
              /*args*/ params.map((p) => p.name)
            )
          ),
          ts.factory.createIdentifier("options"),
        ]
      )
    )
  );
}

function optionsParameterDeclaration(requestIdentifier: string) {
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
          /*typeName*/ ts.factory.createIdentifier("UseQueryOptions"),
          /*typeArgs*/ [
            ts.factory.createTypeReferenceNode(
              /*typeName*/ ts.factory.createIdentifier("Awaited"),
              /*typeArgs*/ [
                ts.factory.createTypeReferenceNode(
                  /*typeName*/ ts.factory.createIdentifier("ReturnType"),
                  /*typeArgs*/ [
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
            ts.factory.createTypeReferenceNode(
              /*typeName*/ ts.factory.createIdentifier("Awaited"),
              /*typeArgs*/ [
                ts.factory.createTypeReferenceNode(
                  /*typeName*/ ts.factory.createIdentifier("ReturnType"),
                  /*typeArgs*/ [
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
            ts.factory.createTypeReferenceNode(
              /*typeName*/ ts.factory.createIdentifier("ReturnType"),
              /*typeArgs*/ [
                ts.factory.createIndexedAccessTypeNode(
                  /*objectType*/ ts.factory.createTypeQueryNode(
                    /*expressionName*/ ts.factory.createIdentifier("queryIds")
                  ),
                  /*indexType*/ ts.factory.createLiteralTypeNode(
                    /*literal*/ ts.factory.createStringLiteral(
                      requestIdentifier
                    )
                  )
                ),
              ]
            ),
          ]
        ),
        ts.factory.createUnionTypeNode(
          /*types*/ [
            ts.factory.createLiteralTypeNode(
              /*literal*/ ts.factory.createStringLiteral("queryKey")
            ),
            ts.factory.createLiteralTypeNode(
              /*literal*/ ts.factory.createStringLiteral("queryFn")
            ),
          ]
        ),
      ]
    ),
    /*initializer*/ undefined
  );
}
