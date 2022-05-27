import ts from "typescript";
import type SwaggerParser from "swagger-parser";
import type { OpenAPIV3 } from "openapi-types";
import {
  toParamObjects,
  schemaObjectOrRefType,
  normalizeOperationId,
  isReferenceObject,
} from "./common";

export function makeRequests(
  paths: OpenAPIV3.PathsObject,
  $refs: SwaggerParser.$Refs
) {
  const requests = Object.entries(paths).flatMap(([pattern, item]) =>
    makeRequestsPropertyAssignment(pattern, item!, $refs)
  );

  return makeRequestsDeclaration(requests);
}

function makeRequestsDeclaration(
  requests: ReturnType<typeof makeRequestsPropertyAssignment>
) {
  const bodyStatements = [
    ts.factory.createReturnStatement(
      /*expression*/ ts.factory.createAsExpression(
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
  item: OpenAPIV3.PathItemObject,
  $refs: SwaggerParser.$Refs
) {
  const requests: ts.PropertyAssignment[] = [];

  if (item.get) {
    requests.push(makeRequest(pattern, "get", item.get, $refs));
  }
  if (item.delete) {
    requests.push(makeRequest(pattern, "delete", item.delete, $refs));
  }
  if (item.post) {
    requests.push(makeRequest(pattern, "post", item.post, $refs));
  }
  if (item.put) {
    requests.push(makeRequest(pattern, "put", item.put, $refs));
  }
  if (item.patch) {
    requests.push(makeRequest(pattern, "patch", item.patch, $refs));
  }
  if (item.head) {
    requests.push(makeRequest(pattern, "head", item.head, $refs));
  }
  if (item.options) {
    requests.push(makeRequest(pattern, "options", item.options, $refs));
  }

  return requests;
}

function isRequestBodyObject(
  obj: OpenAPIV3.ReferenceObject | OpenAPIV3.RequestBodyObject
): obj is OpenAPIV3.RequestBodyObject {
  return "content" in obj;
}

function createRequestParams(
  item: OpenAPIV3.OperationObject,
  $refs: SwaggerParser.$Refs
) {
  const paramObjects = item.parameters ? toParamObjects(item.parameters) : [];

  const itemParamsDeclarations = paramObjects
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
        /*type*/ schemaObjectOrRefType(param.schema).node,
        /*initializer*/ undefined
      ),
    }));

  if (item.requestBody) {
    const payload = ts.factory.createIdentifier("payload");

    itemParamsDeclarations.unshift({
      name: payload,
      arrowFuncParam: ts.factory.createParameterDeclaration(
        /*decorators*/ undefined,
        /*modifiers*/ undefined,
        /*dotDotDotToken*/ undefined,
        /*name*/ payload,
        /*questionToken*/ undefined,
        /*type*/ makeRequestsType($refs, item.requestBody),
        /*initializer*/ undefined
      ),
    });
  }

  return itemParamsDeclarations;
}

type StatusType = "success" | "error" | "default";

function statusCodeToType(statusCode: string): StatusType {
  if (statusCode.startsWith("2")) {
    return "success";
  }

  if (statusCode.startsWith("4") || statusCode.startsWith("5")) {
    return "error";
  }

  return "default";
}

function mediaType(mediaTypeObj: OpenAPIV3.MediaTypeObject) {
  if (!mediaTypeObj.schema) {
    return [];
  }

  const typeName = schemaObjectOrRefType(mediaTypeObj.schema);

  return [typeName];
}

function makeResponses(
  $refs: SwaggerParser.$Refs,
  statusCode: string,
  resOrRef: OpenAPIV3.ReferenceObject | OpenAPIV3.ResponseObject
):
  | [
      {
        statusType: StatusType;
        schemas: ReturnType<typeof schemaObjectOrRefType>[];
      }
    ]
  | [] {
  const obj = isReferenceObject(resOrRef)
    ? ($refs.get(resOrRef.$ref) as OpenAPIV3.ResponseObject)
    : resOrRef;

  const schemas = obj.content
    ? Object.values(obj.content).flatMap((mediaTypeObj) =>
        mediaType(mediaTypeObj)
      )
    : [];

  if (!schemas.length) {
    return [];
  }

  return [
    {
      statusType: statusCodeToType(statusCode),
      schemas,
    },
  ];
}

function getResponseType(
  item: OpenAPIV3.OperationObject,
  $refs: SwaggerParser.$Refs
) {
  const responses = Object.entries(item.responses).flatMap(
    ([statusCode, resOrRef]) => makeResponses($refs, statusCode, resOrRef)
  );

  const successTypes = responses
    .filter(({ statusType }) => statusType === "success")
    .flatMap(({ schemas }) => schemas);

  const uniqSuccessTypes = successTypes.reduce(
    (acc, node) => (acc.find((n) => n.id === node.id) ? acc : acc.concat(node)),
    [] as ReturnType<typeof schemaObjectOrRefType>[]
  );

  if (uniqSuccessTypes.length) {
    return ts.factory.createUnionTypeNode(
      uniqSuccessTypes.map((item) => item.node)
    );
  }

  return ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);
}

function makeRequestsType(
  $refs: SwaggerParser.$Refs,
  reqOrRef: OpenAPIV3.ReferenceObject | OpenAPIV3.RequestBodyObject
) {
  const reqBody = isRequestBodyObject(reqOrRef)
    ? reqOrRef
    : ($refs.get(reqOrRef.$ref) as OpenAPIV3.RequestBodyObject);

  const schemas = reqBody.content
    ? Object.values(reqBody.content).flatMap((mediaTypeObj) =>
        mediaType(mediaTypeObj)
      )
    : undefined;

  if (schemas?.length) {
    const uniqSchema = schemas.reduce(
      (acc, node) =>
        acc.find((n) => n.id === node.id) ? acc : acc.concat(node),
      [] as ReturnType<typeof schemaObjectOrRefType>[]
    );

    return ts.factory.createUnionTypeNode(uniqSchema.map((item) => item.node));
  }

  return ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);
}

function makeRequest(
  pattern: string,
  method: string,
  item: OpenAPIV3.OperationObject,
  $refs: SwaggerParser.$Refs
) {
  const pathTemplateExpression = patternToPath(pattern);
  const arrowFuncParams = createRequestParams(item, $refs).map(
    (param) => param.arrowFuncParam
  );

  const responseType = getResponseType(item, $refs);

  const axiosConfigFields = [
    ts.factory.createPropertyAssignment(
      /*name*/ ts.factory.createIdentifier("method"),
      /*initializer*/ ts.factory.createStringLiteral(method)
    ),
    ts.factory.createPropertyAssignment(
      /*name*/ ts.factory.createIdentifier("url"),
      /*initializer*/ pathTemplateExpression
    ),
  ];

  const paramObjects = item.parameters ? toParamObjects(item.parameters) : [];
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

  // `data` field is only allowed for certain methods
  if (item.requestBody && ["put", "post", "patch", "delete"].includes(method)) {
    axiosConfigFields.push(
      ts.factory.createPropertyAssignment(
        /*name*/ ts.factory.createIdentifier("data"),
        /*initializer*/ ts.factory.createIdentifier("payload")
      )
    );
  }

  return ts.factory.createPropertyAssignment(
    ts.factory.createIdentifier(normalizeOperationId(item.operationId!)),
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
            /*typeArgs*/ [responseType],
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
          /*left*/ ts.factory.createIdentifier(identifier),
          /*operator*/ ts.factory.createToken(
            ts.SyntaxKind.ExclamationEqualsEqualsToken
          ),
          /*right*/ ts.factory.createIdentifier("undefined")
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
    return ts.factory.createNoSubstitutionTemplateLiteral(
      /*text*/ head,
      /*rawText*/ head
    );
  }

  const chunks: string[][] = [];
  const chunkSize = 2;
  for (let i = 0; i < tail.length; i += chunkSize) {
    const chunk = tail.slice(i, i + chunkSize);
    chunks.push(chunk);
  }

  const headTemplate = ts.factory.createTemplateHead(
    /*text*/ head,
    /*rawText*/ head
  );

  const middleTemplates = chunks.map(([name, path], index) =>
    ts.factory.createTemplateSpan(
      /*expression*/ ts.factory.createIdentifier(name.replace(bracesRegex, "")),
      /*literal*/ index === chunks.length - 1
        ? ts.factory.createTemplateTail(path, path)
        : ts.factory.createTemplateMiddle(path, path)
    )
  );

  return ts.factory.createTemplateExpression(headTemplate, middleTemplates);
}
