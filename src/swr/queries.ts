import ts from "typescript";
import type { OpenAPIV3 } from "openapi-types";
import {
  capitalizeFirstLetter,
  createParams,
  normalizeOperationId,
} from "../common/util";
import SwaggerParser from "swagger-parser";

export function makeQueries(
  $refs: SwaggerParser.$Refs,
  paths: OpenAPIV3.PathsObject
) {
  const properties = Object.entries(paths)
    .filter(([_, item]) => !!item?.get)
    .map(([pattern, item]) =>
      makeProperty($refs, pattern, item!.get, item!.parameters)
    );

  const requestsParam = ts.factory.createParameterDeclaration(
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
  $refs: SwaggerParser.$Refs,
  pattern: string,
  get: OpenAPIV3.PathItemObject["get"],
  pathParams: OpenAPIV3.PathItemObject["parameters"]
) {
  if (!get?.operationId) {
    throw `Missing "operationId" from "get" request with pattern ${pattern}`;
  }

  const normalizedOperationId = normalizeOperationId(get.operationId);
  const identifierName = `use${capitalizeFirstLetter(normalizedOperationId)}`;

  const params = createParams($refs, get, pathParams);

  return ts.factory.createPropertyAssignment(
    /*name*/ ts.factory.createIdentifier(identifierName),
    /*initializer*/ ts.factory.createArrowFunction(
      /*modifiers*/ undefined,
      /*typeParams*/ undefined,
      /*params*/ [
        ...params.map((p) => p.arrowFuncParam),
        ts.factory.createParameterDeclaration(
          /*modifiers*/ undefined,
          /*dotDotDotToken*/ undefined,
          /*name*/ ts.factory.createIdentifier("options"),
          /*questionToken*/ ts.factory.createToken(ts.SyntaxKind.QuestionToken),
          /*type*/ ts.factory.createTypeReferenceNode(
            /*typeName*/ ts.factory.createIdentifier("SWRConfiguration"),
            /*typeArguments*/ [
              ts.factory.createTypeReferenceNode(
                /*typeName*/ ts.factory.createIdentifier("Response"),
                /*typeArgs*/ [
                  ts.factory.createLiteralTypeNode(
                    ts.factory.createStringLiteral(normalizedOperationId)
                  ),
                ]
              ),
              ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
            ]
          )
        ),
      ],
      /*type*/ ts.factory.createTypeReferenceNode(
        ts.factory.createIdentifier("SWRResponse"),
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
      /*body*/ ts.factory.createCallExpression(
        /*expression*/ ts.factory.createIdentifier("useSWR"),
        /*typeArgs*/ undefined,
        /*args*/ [
          ts.factory.createCallExpression(
            /*expression*/ ts.factory.createPropertyAccessExpression(
              /*expression*/ ts.factory.createIdentifier("queryKeys"),
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
