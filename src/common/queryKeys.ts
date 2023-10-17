import ts from "typescript";
import type { OpenAPIV3 } from "openapi-types";
import { normalizeOperationId, createParams } from "./util";
import SwaggerParser from "swagger-parser";

const NULL_IF_UNDEFINED_FN_NAME = "nullIfUndefined";

export function makeQueryKeys(
  $refs: SwaggerParser.$Refs,
  paths: OpenAPIV3.PathsObject
) {
  const queryKeys = Object.entries(paths)
    .filter(([_, item]) => !!item?.get)
    .map(([pattern, item]) =>
      makeQueryKey($refs, pattern, item!.get, item!.parameters)
    );

  return [
    makeNullIfUndefinedFunctionDeclaration(),
    makeQueryKeysObject(queryKeys),
    makeExportQueryKeyType(),
  ];
}

function makeNullIfUndefinedFunctionDeclaration() {
  return ts.factory.createFunctionDeclaration(
    undefined,
    undefined,
    ts.factory.createIdentifier(NULL_IF_UNDEFINED_FN_NAME),
    [
      ts.factory.createTypeParameterDeclaration(
        undefined,
        ts.factory.createIdentifier("T"),
        undefined,
        undefined
      ),
    ],
    [
      ts.factory.createParameterDeclaration(
        undefined,
        undefined,
        ts.factory.createIdentifier("value"),
        undefined,
        ts.factory.createTypeReferenceNode(
          ts.factory.createIdentifier("T"),
          undefined
        ),
        undefined
      ),
    ],
    ts.factory.createUnionTypeNode([
      ts.factory.createTypeReferenceNode(
        ts.factory.createIdentifier("NonNullable"),
        [
          ts.factory.createTypeReferenceNode(
            ts.factory.createIdentifier("T"),
            undefined
          ),
        ]
      ),
      ts.factory.createLiteralTypeNode(ts.factory.createNull()),
    ]),
    ts.factory.createBlock(
      [
        ts.factory.createReturnStatement(
          ts.factory.createConditionalExpression(
            ts.factory.createBinaryExpression(
              ts.factory.createTypeOfExpression(
                ts.factory.createIdentifier("value")
              ),
              ts.factory.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
              ts.factory.createStringLiteral("undefined")
            ),
            ts.factory.createToken(ts.SyntaxKind.QuestionToken),
            ts.factory.createNull(),
            ts.factory.createToken(ts.SyntaxKind.ColonToken),
            ts.factory.createAsExpression(
              ts.factory.createIdentifier("value"),
              ts.factory.createUnionTypeNode([
                ts.factory.createTypeReferenceNode(
                  ts.factory.createIdentifier("NonNullable"),
                  [
                    ts.factory.createTypeReferenceNode(
                      ts.factory.createIdentifier("T"),
                      undefined
                    ),
                  ]
                ),
                ts.factory.createLiteralTypeNode(ts.factory.createNull()),
              ])
            )
          )
        ),
      ],
      true
    )
  );
}

function makeQueryKeysObject(queryKeys: ts.PropertyAssignment[]) {
  return ts.factory.createVariableStatement(
    [ts.factory.createToken(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createVariableDeclarationList(
      [
        ts.factory.createVariableDeclaration(
          ts.factory.createIdentifier("queryKeys"),
          undefined,
          undefined,
          ts.factory.createAsExpression(
            ts.factory.createObjectLiteralExpression(queryKeys, true),
            ts.factory.createTypeReferenceNode(
              ts.factory.createIdentifier("const"),
              undefined
            )
          )
        ),
      ],
      ts.NodeFlags.Const
    )
  );
}

// queryKey's are only made for GET's
function makeQueryKey(
  $refs: SwaggerParser.$Refs,
  pattern: string,
  get: OpenAPIV3.PathItemObject["get"],
  pathParams: OpenAPIV3.PathItemObject["parameters"]
): ts.PropertyAssignment {
  if (!get?.operationId) {
    throw `Missing "operationId" from "get" request with pattern "${pattern}"`;
  }

  const normalizedOperationId = normalizeOperationId(get.operationId);
  const params = createParams($refs, get, pathParams);

  return ts.factory.createPropertyAssignment(
    /*name*/ ts.factory.createIdentifier(normalizedOperationId),
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
          /*elements*/ [
            ts.factory.createStringLiteral(normalizedOperationId),
            ...params.map((p) =>
              p.required
                ? p.name
                : ts.factory.createCallExpression(
                    /*expression*/ ts.factory.createIdentifier(
                      NULL_IF_UNDEFINED_FN_NAME
                    ),
                    /*typeArguments*/ undefined,
                    /*argumentsArray*/ [p.name]
                  )
            ),
          ],
          /*multiline*/ false
        ),
        ts.factory.createTypeReferenceNode(
          /*typeName*/ ts.factory.createIdentifier("const"),
          /*typeArgs*/ undefined
        )
      )
    )
  );
}

function makeExportQueryKeyType(): ts.TypeAliasDeclaration {
  return ts.factory.createTypeAliasDeclaration(
    [ts.factory.createToken(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createIdentifier("QueryKeys"),
    undefined,
    ts.factory.createTypeQueryNode(
      ts.factory.createIdentifier("queryKeys"),
      undefined
    )
  );
}
