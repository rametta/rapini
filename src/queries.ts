import ts from "typescript";
import type { OpenAPIV3 } from "openapi-types";
import {
  capitalizeFirstLetter,
  isSchemaObject,
  schemaObjectTypeToTS,
  toParamObjects,
} from "./common";

export function makeQueries(paths: OpenAPIV3.PathsObject) {
  const properties = Object.entries(paths)
    .filter(([_, item]) => !!item.get)
    .map(([pattern, item]) => makeProperty(pattern, item.get));

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
          ts.factory.createAsExpression(
            /*expression*/ ts.factory.createObjectLiteralExpression(
              properties,
              /*multiline*/ true
            ),
            /*type*/ ts.factory.createTypeReferenceNode(
              ts.factory.createIdentifier("const"),
              undefined
            )
          )
        ),
      ],
      true
    )
  );
}

function makeProperty(pattern: string, get: OpenAPIV3.PathItemObject["get"]) {
  if (!get.operationId) {
    throw `Missing "operationId" from "get" request with pattern ${pattern}`;
  }

  const identifierName = `use${capitalizeFirstLetter(get.operationId)}`;

  const params = createParams(get);

  return ts.factory.createPropertyAssignment(
    /*name*/ ts.factory.createIdentifier(identifierName),
    /*initializer*/ ts.factory.createArrowFunction(
      /*modifiers*/ undefined,
      /*typeParams*/ undefined,
      /*params*/ params.map((p) => p.arrowFuncParam),
      /*type*/ undefined,
      /*equalsGreaterThanToken*/ ts.factory.createToken(
        ts.SyntaxKind.EqualsGreaterThanToken
      ),
      /*body*/ ts.factory.createCallExpression(
        /*expression*/ ts.factory.createIdentifier("useQuery"),
        /*typeArgs*/ undefined,
        /*args*/ [
          ts.factory.createCallExpression(
            /*expression*/ ts.factory.createPropertyAccessExpression(
              ts.factory.createIdentifier("queryIds"),
              ts.factory.createIdentifier(get.operationId)
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
                /*name*/ ts.factory.createIdentifier(get.operationId)
              ),
              /*typeArguments*/ undefined,
              /*args*/ params.map((p) => p.name)
            )
          ),
        ]
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
