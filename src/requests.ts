import ts from "typescript";
import type { OpenAPIV3 } from "openapi-types";
import { toParamObjects, createParams } from "./common";

export function makeRequests(paths: OpenAPIV3.PathsObject) {
  const requests = Object.entries(paths).flatMap(([pattern, item]) =>
    makeRequestsPropertyAssignment(pattern, item)
  );

  return makeRequestsDeclaration(requests);
}

function makeRequestsDeclaration(
  requests: ReturnType<typeof makeRequestsPropertyAssignment>
) {
  const bodyStatements = [
    ts.factory.createReturnStatement(
      ts.factory.createAsExpression(
        /*expression*/ ts.factory.createObjectLiteralExpression(
          /*properties*/ requests,
          /*multiline*/ true
        ),
        /*type*/ ts.factory.createTypeReferenceNode(
          /*typeName*/ ts.factory.createIdentifier("const"),
          /*typeArgs*/ undefined
        )
      )
    ),
  ];

  return ts.factory.createFunctionDeclaration(
    /*decorators*/ undefined,
    /*modifiers*/ undefined,
    /*asteriskToken*/ undefined,
    /*name*/ ts.factory.createIdentifier("makeRequests"),
    /*typeParameters*/ undefined,
    /*parameters*/ [
      ts.factory.createParameterDeclaration(
        /*decorators*/ undefined,
        /*modifiers*/ undefined,
        /*dotDotDotToken*/ undefined,
        /*name*/ ts.factory.createIdentifier("axios"),
        /*questionToken*/ undefined,
        /*type*/ ts.factory.createTypeReferenceNode(
          /*typeName*/ ts.factory.createIdentifier("AxiosInstance"),
          /*typeArguments*/ undefined
        ),
        /*initializer*/ undefined
      ),
    ],
    /*type*/ undefined,
    /*body*/ ts.factory.createBlock(bodyStatements, /*multiline*/ true)
  );
}

function makeRequestsPropertyAssignment(
  pattern: string,
  item: OpenAPIV3.PathItemObject
) {
  const requests: ts.PropertyAssignment[] = [];

  if (item.get) {
    requests.push(makeRequest(pattern, "get", item.get));
  }
  if (item.delete) {
    requests.push(makeRequest(pattern, "delete", item.delete));
  }
  if (item.post) {
    requests.push(makeRequest(pattern, "post", item.post));
  }
  if (item.put) {
    requests.push(makeRequest(pattern, "put", item.put));
  }
  if (item.patch) {
    requests.push(makeRequest(pattern, "patch", item.patch));
  }
  if (item.head) {
    requests.push(makeRequest(pattern, "head", item.head));
  }
  if (item.options) {
    requests.push(makeRequest(pattern, "options", item.options));
  }

  return requests;
}

function makeRequest(
  pattern: string,
  method: string,
  item: OpenAPIV3.OperationObject
) {
  const pathTemplateExpression = patternToPath(pattern);
  const arrowFuncParams = createParams(item).map(
    (param) => param.arrowFuncParam
  );

  const axiosConfigFields = [
    ts.factory.createPropertyAssignment(
      ts.factory.createIdentifier("method"),
      ts.factory.createStringLiteral(method)
    ),
    ts.factory.createPropertyAssignment(
      ts.factory.createIdentifier("url"),
      pathTemplateExpression
    ),
  ];

  const paramObjects = toParamObjects(item.parameters);
  const queryParamObjects = paramObjects.filter(
    (paramObject) => paramObject.in === "query"
  );
  const queryParamProperties = queryParamObjects.map((paramObject) =>
    paramObject.required
      ? ts.factory.createShorthandPropertyAssignment(
          /*name*/ ts.factory.createIdentifier(paramObject.name),
          /*objectAssignmentInitializer*/ undefined
        )
      : shorthandOptionalObjectLiteralSpread(paramObject.name)
  );

  if (queryParamProperties.length) {
    axiosConfigFields.push(
      ts.factory.createPropertyAssignment(
        /*name*/ ts.factory.createIdentifier("params"),
        /*initializer*/ ts.factory.createObjectLiteralExpression(
          /*properties*/ queryParamProperties,
          /*multiline*/ true
        )
      )
    );
  }

  const data = [
    ts.factory.createPropertyAssignment(
      ts.factory.createIdentifier("field2"),
      ts.factory.createIdentifier("value2")
    ),
    ts.factory.createPropertyAssignment(
      ts.factory.createIdentifier("field3"),
      ts.factory.createIdentifier("value3")
    ),
  ];

  // add to data

  // `data` field is only allowed for certain methods
  if (data.length && ["put", "post", "patch", "delete"].includes(method)) {
    axiosConfigFields.push(
      ts.factory.createPropertyAssignment(
        /*name*/ ts.factory.createIdentifier("data"),
        /*initializer*/ ts.factory.createObjectLiteralExpression(
          /*properties*/ data,
          /*multiline*/ true
        )
      )
    );
  }

  return ts.factory.createPropertyAssignment(
    ts.factory.createIdentifier(item.operationId),
    ts.factory.createArrowFunction(
      /*modifiers*/ undefined,
      /*typeParams*/ undefined,
      /*params*/ arrowFuncParams,
      /*type*/ undefined,
      /*equalsGreaterThanToken*/ ts.factory.createToken(
        ts.SyntaxKind.EqualsGreaterThanToken
      ),
      /*body*/
      ts.factory.createCallExpression(
        /*expression*/ ts.factory.createPropertyAccessExpression(
          /*expression*/ ts.factory.createCallExpression(
            /*expression*/ ts.factory.createPropertyAccessExpression(
              /*expression*/ ts.factory.createIdentifier("axios"),
              /*name*/ ts.factory.createIdentifier("request")
            ),
            /*typeArgs*/ [
              ts.factory.createTypeReferenceNode(
                /*typeName*/ ts.factory.createIdentifier("Pet"), // TODO replace with real type
                /*typeArgs*/ undefined
              ),
            ],
            /*args*/ [
              ts.factory.createObjectLiteralExpression(axiosConfigFields, true),
            ]
          ),
          /*name*/ ts.factory.createIdentifier("then")
        ),
        /*typeArgs*/ undefined,
        /*args*/ [
          ts.factory.createArrowFunction(
            /*modifiers*/ undefined,
            /*typeParameters*/ undefined,
            /*parameters*/ [
              ts.factory.createParameterDeclaration(
                /*decorators*/ undefined,
                /*modifiers*/ undefined,
                /*dotDotDotToken*/ undefined,
                /*name*/ ts.factory.createIdentifier("res"),
                /*questionToken*/ undefined,
                /*type*/ undefined,
                /*initializer*/ undefined
              ),
            ],
            /*type*/ undefined,
            /*equalsGreaterThanToken*/ ts.factory.createToken(
              ts.SyntaxKind.EqualsGreaterThanToken
            ),
            /*body*/ ts.factory.createPropertyAccessExpression(
              /*expression*/ ts.factory.createIdentifier("res"),
              /*name*/ ts.factory.createIdentifier("data")
            )
          ),
        ]
      )
    )
  );
}

// Optionally spreads a field if not null
// Ex: ...(identifier !== null && identifier !== undefined ? { identifier } : undefined)
function shorthandOptionalObjectLiteralSpread(identifier: string) {
  return ts.factory.createSpreadAssignment(
    ts.factory.createParenthesizedExpression(
      ts.factory.createConditionalExpression(
        /*condition*/ ts.factory.createBinaryExpression(
          ts.factory.createBinaryExpression(
            /*left*/ ts.factory.createIdentifier(identifier),
            /*operator*/ ts.factory.createToken(
              ts.SyntaxKind.ExclamationEqualsEqualsToken
            ),
            /*right*/ ts.factory.createNull()
          ),
          ts.factory.createToken(ts.SyntaxKind.AmpersandAmpersandToken),
          ts.factory.createBinaryExpression(
            /*left*/ ts.factory.createIdentifier(identifier),
            /*operator*/ ts.factory.createToken(
              ts.SyntaxKind.ExclamationEqualsEqualsToken
            ),
            /*right*/ ts.factory.createIdentifier("undefined")
          )
        ),
        /*questionToken*/ ts.factory.createToken(ts.SyntaxKind.QuestionToken),
        /*whenTrue*/ ts.factory.createObjectLiteralExpression(
          /*properties*/ [
            ts.factory.createShorthandPropertyAssignment(
              /*name*/ ts.factory.createIdentifier(identifier),
              /*objectAssignmentInitializer*/ undefined
            ),
          ],
          /*multiLine*/ false
        ),
        /*colonToken*/ ts.factory.createToken(ts.SyntaxKind.ColonToken),
        /*whenFalse*/ ts.factory.createIdentifier("undefined")
      )
    )
  );
}

// Match everything inside of curly braces
// Ex: /api/pet/{petId} -> would match {petId}
const patternRegex = /({.+?})/;

// Match all braces, like { or }
const bracesRegex = /{|}/g;

function patternToPath(pattern: string) {
  const splits = pattern.split(patternRegex);
  const [head, ...tail] = splits;

  if (tail.length === 0) {
    return ts.factory.createNoSubstitutionTemplateLiteral(head, head);
  }

  const chunks: string[][] = [];
  const chunkSize = 2;
  for (let i = 0; i < tail.length; i += chunkSize) {
    const chunk = tail.slice(i, i + chunkSize);
    chunks.push(chunk);
  }

  const headTemplate = ts.factory.createTemplateHead(head, head);

  const middleTemplates = chunks.map(([name, path], index) =>
    ts.factory.createTemplateSpan(
      ts.factory.createIdentifier(name.replace(bracesRegex, "")),
      index === chunks.length - 1
        ? ts.factory.createTemplateTail(path, path)
        : ts.factory.createTemplateMiddle(path, path)
    )
  );

  return ts.factory.createTemplateExpression(headTemplate, middleTemplates);
}
