import ts from "typescript";
import type { OpenAPIV3 } from "openapi-types";
import { normalizeOperationId, createParams } from "./util";

const NULL_IF_UNDEFINED_FN_NAME = "nullIfUndefined";

export function makeQueryIds(paths: OpenAPIV3.PathsObject) {
  const queryIds = Object.entries(paths)
    .filter(([_, item]) => !!item?.get)
    .map(([pattern, item]) =>
      makeQueryId(pattern, item!.get, item!.parameters)
    );

  return [
    makeNullIfUndefinedFunctionDeclaration(),
    makeQueryIdsFunctionDeclaration(queryIds),
  ];
}

function makeNullIfUndefinedFunctionDeclaration() {
  return ts.factory.createFunctionDeclaration(
    undefined,
    undefined,
    undefined,
    ts.factory.createIdentifier(NULL_IF_UNDEFINED_FN_NAME),
    [ts.factory.createTypeParameterDeclaration(
      undefined,
      ts.factory.createIdentifier("T"),
      undefined,
      undefined
    )],
    [ts.factory.createParameterDeclaration(
      undefined,
      undefined,
      undefined,
      ts.factory.createIdentifier("value"),
      undefined,
      ts.factory.createTypeReferenceNode(
        ts.factory.createIdentifier("T"),
        undefined
      ),
      undefined
    )],
    ts.factory.createUnionTypeNode([
      ts.factory.createTypeReferenceNode(
        ts.factory.createIdentifier("NonNullable"),
        [ts.factory.createTypeReferenceNode(
          ts.factory.createIdentifier("T"),
          undefined
        )]
      ),
      ts.factory.createLiteralTypeNode(ts.factory.createNull())
    ]),
    ts.factory.createBlock(
      [ts.factory.createReturnStatement(ts.factory.createConditionalExpression(
        ts.factory.createBinaryExpression(
          ts.factory.createTypeOfExpression(ts.factory.createIdentifier("value")),
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
              [ts.factory.createTypeReferenceNode(
                ts.factory.createIdentifier("T"),
                undefined
              )]
            ),
            ts.factory.createLiteralTypeNode(ts.factory.createNull())
          ])
        )
      ))],
      true
    )
  )
}

function makeQueryIdsFunctionDeclaration(
  queryIds: ReturnType<typeof makeQueryId>[]
) {
  const returnStatement = ts.factory.createReturnStatement(
    ts.factory.createAsExpression(
      /*expression*/ ts.factory.createObjectLiteralExpression(
        queryIds,
        /*multiline*/ true
      ),
      /*type*/ ts.factory.createTypeReferenceNode(
        /*typeName*/ ts.factory.createIdentifier("const"),
        /*typeArgs*/ undefined
      )
    )
  );

  return ts.factory.createFunctionDeclaration(
    /*decorators*/ undefined,
    /*modifiers*/ undefined,
    /*asteriskToken*/ undefined,
    /*name*/ ts.factory.createIdentifier("makeQueryIds"),
    /*typeParameters*/ undefined,
    /*parameters*/ [],
    /*type*/ undefined,
    /*body*/ ts.factory.createBlock(
      /*statments*/ [returnStatement],
      /*multiline*/ true
    )
  );
}

// queryIds's are only made for GET's
function makeQueryId(
  pattern: string,
  get: OpenAPIV3.PathItemObject["get"],
  pathParams: OpenAPIV3.PathItemObject["parameters"]
) {
  if (!get?.operationId) {
    throw `Missing "operationId" from "get" request with pattern ${pattern}`;
  }

  const normalizedOperationId = normalizeOperationId(get.operationId);
  const params = createParams(get, pathParams);

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
