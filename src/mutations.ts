import ts from "typescript";
import type { OpenAPIV3 } from "openapi-types";
import SwaggerParser from "swagger-parser";
import {
  capitalizeFirstLetter,
  isSchemaObject,
  normalizeOperationId,
  schemaObjectTypeToTS,
  toParamObjects,
} from "./common";

export function makeMutations(
  paths: OpenAPIV3.PathsObject,
  $refs: SwaggerParser.$Refs
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
      /*typeName*/ ts.factory.createIdentifier("ReturnType"),
      /*typeArgs*/ [
        ts.factory.createTypeQueryNode(
          /*exprName*/ ts.factory.createIdentifier("makeRequests")
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
    /*parameters*/ [requestsParam],
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
    properties.push(makeProperty(pattern, path.post, "post"));
  }

  if (path.put) {
    properties.push(makeProperty(pattern, path.put, "put"));
  }

  if (path.patch) {
    properties.push(makeProperty(pattern, path.patch, "patch"));
  }

  if (path.delete) {
    properties.push(makeProperty(pattern, path.delete, "delete"));
  }

  return properties;
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
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
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
  method: string
) {
  const operationId = operation.operationId;
  if (!operationId) {
    throw `Missing "operationId" from "${method}" request with pattern ${pattern}`;
  }
  const normalizedOperationId = normalizeOperationId(operationId);

  const identifier = `use${capitalizeFirstLetter(normalizedOperationId)}`;
  const params = createParams(operation);

  const hasRequestBody = !!operation.requestBody;

  const body = /*expression*/ ts.factory.createCallExpression(
    /*expression*/ ts.factory.createIdentifier("useMutation"),
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
      ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
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
      ts.factory.createIdentifier("options"),
    ]
  );

  return ts.factory.createPropertyAssignment(
    /*name*/ ts.factory.createIdentifier(identifier),
    /*initializer*/ ts.factory.createArrowFunction(
      /*modifiers*/ undefined,
      /*typeParameters*/ undefined,
      /*parameters*/ [
        ...params.map((p) => p.arrowFuncParam),
        optionsParameterDeclaration(normalizedOperationId),
      ],
      /*type*/ undefined,
      /*equalsGreaterThanToken*/ ts.factory.createToken(
        ts.SyntaxKind.EqualsGreaterThanToken
      ),
      /*body*/ body
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
