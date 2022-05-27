import ts from "typescript";
import type { OpenAPIV3 } from "openapi-types";
import { normalizeOperationId, createParams } from "./common";

export function makeQueryIds(paths: OpenAPIV3.PathsObject) {
  const queryIds = Object.entries(paths)
    .filter(([_, item]) => !!item?.get)
    .map(([pattern, item]) => makeQueryId(pattern, item!.get));

  return makeQueryIdsFunctionDeclaration(queryIds);
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
function makeQueryId(pattern: string, get: OpenAPIV3.PathItemObject["get"]) {
  if (!get?.operationId) {
    throw `Missing "operationId" from "get" request with pattern ${pattern}`;
  }

  const normalizedOperationId = normalizeOperationId(get.operationId);
  const params = createParams(get);

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
            ...params.map((p) => p.name),
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
