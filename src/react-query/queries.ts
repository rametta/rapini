import ts from "typescript";
import type { OpenAPIV3 } from "openapi-types";
import SwaggerParser from "swagger-parser";
import {
  capitalizeFirstLetter,
  createParams,
  normalizeOperationId,
} from "../common/util";

export function makeQueries(
  paths: OpenAPIV3.PathsObject,
  $refs?: SwaggerParser.$Refs
) {
  const properties = Object.entries(paths)
    .filter(([_, item]) => !!item?.get)
    .map(([pattern, item]) =>
      makeProperty(pattern, item!.get, item!.parameters)
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

  return ts.factory.createFunctionDeclaration(
    /*decorators*/ undefined,
    /*modifiers*/ undefined,
    /*asteriskToken*/ undefined,
    /*name*/ ts.factory.createIdentifier("makeQueries"),
    /*typeParameters*/ undefined,
    /*parameters*/ [requestsParam],
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

function makeProperty(
  pattern: string,
  get: OpenAPIV3.PathItemObject["get"],
  pathParams: OpenAPIV3.PathItemObject["parameters"]
) {
  if (!get?.operationId) {
    throw `Missing "operationId" from "get" request with pattern ${pattern}`;
  }

  const normalizedOperationId = normalizeOperationId(get.operationId);
  const identifierName = `use${capitalizeFirstLetter(normalizedOperationId)}`;

  const params = createParams(get, pathParams);

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
            ts.factory.createIdentifier("Response"),
            [
              ts.factory.createLiteralTypeNode(
                ts.factory.createStringLiteral(normalizedOperationId)
              ),
            ]
          ),
          ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
        ]
      ),
      /*equalsGreaterThanToken*/ ts.factory.createToken(
        ts.SyntaxKind.EqualsGreaterThanToken
      ),
      ts.factory.createCallExpression(
        ts.factory.createIdentifier("useQuery"),
        undefined,
        [
          ts.factory.createObjectLiteralExpression(
            [
              ts.factory.createPropertyAssignment(
                ts.factory.createIdentifier("queryKey"),
                ts.factory.createCallExpression(
                  ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier("queryKeys"),
                    ts.factory.createIdentifier(normalizedOperationId)
                  ),
                  undefined,
                  params.map((p) => p.name)
                )
              ),
              ts.factory.createPropertyAssignment(
                ts.factory.createIdentifier("queryFn"),
                ts.factory.createArrowFunction(
                  undefined,
                  undefined,
                  [],
                  undefined,
                  ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                  ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                      ts.factory.createIdentifier("requests"),
                      ts.factory.createIdentifier(normalizedOperationId)
                    ),
                    undefined,
                    params.map((p) => p.name)
                  )
                )
              ),
              ts.factory.createSpreadAssignment(
                ts.factory.createIdentifier("options")
              ),
            ],
            false
          ),
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
              /*typeName*/ ts.factory.createIdentifier("Response"),
              /*typeArgs*/ [
                ts.factory.createLiteralTypeNode(
                  ts.factory.createStringLiteral(requestIdentifier)
                ),
              ]
            ),
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
            ts.factory.createTypeReferenceNode(
              /*typeName*/ ts.factory.createIdentifier("Response"),
              /*typeArgs*/ [
                ts.factory.createLiteralTypeNode(
                  ts.factory.createStringLiteral(requestIdentifier)
                ),
              ]
            ),
            ts.factory.createTypeReferenceNode(
              /*typeName*/ ts.factory.createIdentifier("ReturnType"),
              /*typeArgs*/ [
                ts.factory.createIndexedAccessTypeNode(
                  /*objectType*/ ts.factory.createTypeReferenceNode(
                    ts.factory.createIdentifier("QueryKeys"),
                    undefined
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
