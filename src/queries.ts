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
  if (!get?.operationId) {
    throw `Missing "operationId" from "get" request with pattern ${pattern}`;
  }

  const identifierName = `use${capitalizeFirstLetter(get.operationId)}`;

  const params = createParams(get);

  return ts.factory.createPropertyAssignment(
    /*name*/ ts.factory.createIdentifier(identifierName),
    /*initializer*/ ts.factory.createArrowFunction(
      /*modifiers*/ undefined,
      /*typeParams*/ undefined,
      /*params*/ [
        ...params.map((p) => p.arrowFuncParam),
        optionsParameterDeclaration(get.operationId),
      ],
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
          ts.factory.createIdentifier("options"),
        ]
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
          ts.factory.createIdentifier("UseQueryOptions"),
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
            ts.factory.createTypeReferenceNode(
              ts.factory.createIdentifier("ReturnType"),
              [
                ts.factory.createIndexedAccessTypeNode(
                  ts.factory.createTypeQueryNode(
                    ts.factory.createIdentifier("queryIds")
                  ),
                  ts.factory.createLiteralTypeNode(
                    ts.factory.createStringLiteral(requestIdentifier)
                  )
                ),
              ]
            ),
          ]
        ),
        ts.factory.createUnionTypeNode([
          ts.factory.createLiteralTypeNode(
            ts.factory.createStringLiteral("queryKey")
          ),
          ts.factory.createLiteralTypeNode(
            ts.factory.createStringLiteral("queryFn")
          ),
        ]),
      ]
    ),
    /*initializer*/ undefined
  );
}

// options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof requests.showPetById>>, unknown, Awaited<ReturnType<typeof requests.showPetById>>, ReturnType<typeof queryIds['listPets']>>, "queryKey" | "queryFn">
