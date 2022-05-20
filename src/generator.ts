import ts from "typescript";
import SwaggerParser from "@apidevtools/swagger-parser";
import { print } from "./print";
import { parse } from "./parser";

function makeImportAxiosInstanceTypeDeclaration() {
  return ts.factory.createImportDeclaration(
    /*decorators*/ undefined,
    /*modifiers*/ undefined,
    /*importClause*/ ts.factory.createImportClause(
      /*isTypeOnly*/ true,
      /*name*/ undefined,
      /*namedBindings*/ ts.factory.createNamedImports([
        ts.factory.createImportSpecifier(
          /*isTypeOnly*/ false,
          /*propertyName*/ undefined,
          /*name*/ ts.factory.createIdentifier("AxiosInstance")
        ),
      ])
    ),
    /*moduleSpecifier*/ ts.factory.createStringLiteral("axios"),
    /*assertClause*/ undefined
  );
}

function makeImportReactQueryDeclartion() {
  const importClause = ts.factory.createImportClause(
    /*typeOnly*/ false,
    /*name*/ undefined,
    /*namedBindings*/ ts.factory.createNamedImports([
      ts.factory.createImportSpecifier(
        /*typeOnly*/ false,
        /*propertyName*/ undefined,
        /*name*/ ts.factory.createIdentifier("useQuery")
      ),
      ts.factory.createImportSpecifier(
        /*typeOnly*/ false,
        /*propertyName*/ undefined,
        /*name*/ ts.factory.createIdentifier("useMutation")
      ),
      ts.factory.createImportSpecifier(
        /*typeOnly*/ false,
        /*propertyName*/ undefined,
        /*name*/ ts.factory.createIdentifier("useQueryClient")
      ),
    ])
  );

  return ts.factory.createImportDeclaration(
    /*decorators*/ undefined,
    /*modifers*/ undefined,
    /*importClause*/ importClause,
    /*moduleSpecifier*/ ts.factory.createStringLiteral("react-query"),
    /*assertClause*/ undefined
  );
}

function makeType() {
  // DYNAMIC
  return ts.factory.createTypeAliasDeclaration(
    undefined,
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createIdentifier("Customer"),
    undefined,
    ts.factory.createTypeLiteralNode([
      ts.factory.createPropertySignature(
        undefined,
        ts.factory.createIdentifier("name"),
        undefined,
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
      ),
      ts.factory.createPropertySignature(
        undefined,
        ts.factory.createIdentifier("address"),
        undefined,
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
      ),
    ])
  );
}

function makeOtherType() {
  // DYNAMIC
  return ts.factory.createTypeAliasDeclaration(
    undefined,
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createIdentifier("UpdateCustomer"),
    undefined,
    ts.factory.createTypeLiteralNode([
      ts.factory.createPropertySignature(
        undefined,
        ts.factory.createIdentifier("name"),
        undefined,
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
      ),
      ts.factory.createPropertySignature(
        undefined,
        ts.factory.createIdentifier("address"),
        undefined,
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
      ),
    ])
  );
}

function makeRequests(requests: ReturnType<typeof parse>["requests"]) {
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

function makeQueries() {
  //#region DYNAMIC
  const properties = [
    ts.factory.createPropertyAssignment(
      ts.factory.createIdentifier("useCustomer"),
      ts.factory.createArrowFunction(
        undefined,
        undefined,
        [
          ts.factory.createParameterDeclaration(
            undefined,
            undefined,
            undefined,
            ts.factory.createIdentifier("customerId"),
            undefined,
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
            undefined
          ),
        ],
        undefined,
        ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
        ts.factory.createCallExpression(
          ts.factory.createIdentifier("useQuery"),
          undefined,
          [
            ts.factory.createCallExpression(
              ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier("queryIds"),
                ts.factory.createIdentifier("getCustomer")
              ),
              undefined,
              [ts.factory.createIdentifier("customerId")]
            ),
            ts.factory.createArrowFunction(
              undefined,
              undefined,
              [],
              undefined,
              ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
              ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(
                  ts.factory.createIdentifier("requests"),
                  ts.factory.createIdentifier("getCustomer")
                ),
                undefined,
                [ts.factory.createIdentifier("customerId")]
              )
            ),
          ]
        )
      )
    ),
    ts.factory.createPropertyAssignment(
      ts.factory.createIdentifier("useCustomers"),
      ts.factory.createArrowFunction(
        undefined,
        undefined,
        [],
        undefined,
        ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
        ts.factory.createCallExpression(
          ts.factory.createIdentifier("useQuery"),
          undefined,
          [
            ts.factory.createCallExpression(
              ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier("queryIds"),
                ts.factory.createIdentifier("getCustomers")
              ),
              undefined,
              []
            ),
            ts.factory.createArrowFunction(
              undefined,
              undefined,
              [],
              undefined,
              ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
              ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(
                  ts.factory.createIdentifier("requests"),
                  ts.factory.createIdentifier("getCustomers")
                ),
                undefined,
                []
              )
            ),
          ]
        )
      )
    ),
  ];
  //#endregion

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

function makeMutations() {
  //#region DYNAMIC
  const properties = [
    ts.factory.createPropertyAssignment(
      ts.factory.createIdentifier("useUpdateCustomer"),
      ts.factory.createArrowFunction(
        undefined,
        undefined,
        [
          ts.factory.createParameterDeclaration(
            undefined,
            undefined,
            undefined,
            ts.factory.createIdentifier("customerId"),
            undefined,
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
            undefined
          ),
        ],
        undefined,
        ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
        ts.factory.createBlock(
          [
            ts.factory.createVariableStatement(
              undefined,
              ts.factory.createVariableDeclarationList(
                [
                  ts.factory.createVariableDeclaration(
                    ts.factory.createIdentifier("queryClient"),
                    undefined,
                    undefined,
                    ts.factory.createCallExpression(
                      ts.factory.createIdentifier("useQueryClient"),
                      undefined,
                      []
                    )
                  ),
                ],
                ts.NodeFlags.Const
              )
            ),
            ts.factory.createReturnStatement(
              ts.factory.createCallExpression(
                ts.factory.createIdentifier("useMutation"),
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
                              ts.factory.createIdentifier("postCustomer")
                            )
                          ),
                        ]
                      ),
                    ]
                  ),
                  ts.factory.createKeywordTypeNode(
                    ts.SyntaxKind.UnknownKeyword
                  ),
                  ts.factory.createTypeReferenceNode(
                    ts.factory.createIdentifier("UpdateCustomer"),
                    undefined
                  ),
                ],
                [
                  ts.factory.createArrowFunction(
                    undefined,
                    undefined,
                    [
                      ts.factory.createParameterDeclaration(
                        undefined,
                        undefined,
                        undefined,
                        ts.factory.createIdentifier("payload"),
                        undefined,
                        undefined,
                        undefined
                      ),
                    ],
                    undefined,
                    ts.factory.createToken(
                      ts.SyntaxKind.EqualsGreaterThanToken
                    ),
                    ts.factory.createCallExpression(
                      ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier("requests"),
                        ts.factory.createIdentifier("postCustomer")
                      ),
                      undefined,
                      [
                        ts.factory.createIdentifier("customerId"),
                        ts.factory.createIdentifier("payload"),
                      ]
                    )
                  ),
                  ts.factory.createObjectLiteralExpression(
                    [
                      ts.factory.createPropertyAssignment(
                        ts.factory.createIdentifier("onSuccess"),
                        ts.factory.createArrowFunction(
                          undefined,
                          undefined,
                          [
                            ts.factory.createParameterDeclaration(
                              undefined,
                              undefined,
                              undefined,
                              ts.factory.createIdentifier("response"),
                              undefined,
                              undefined,
                              undefined
                            ),
                          ],
                          undefined,
                          ts.factory.createToken(
                            ts.SyntaxKind.EqualsGreaterThanToken
                          ),
                          ts.factory.createBlock(
                            [
                              ts.factory.createExpressionStatement(
                                ts.factory.createCallExpression(
                                  ts.factory.createPropertyAccessExpression(
                                    ts.factory.createIdentifier("queryClient"),
                                    ts.factory.createIdentifier("setQueryData")
                                  ),
                                  undefined,
                                  [
                                    ts.factory.createCallExpression(
                                      ts.factory.createPropertyAccessExpression(
                                        ts.factory.createIdentifier("queryIds"),
                                        ts.factory.createIdentifier(
                                          "getCustomer"
                                        )
                                      ),
                                      undefined,
                                      [
                                        ts.factory.createIdentifier(
                                          "customerId"
                                        ),
                                      ]
                                    ),
                                    ts.factory.createIdentifier("response"),
                                  ]
                                )
                              ),
                              ts.factory.createExpressionStatement(
                                ts.factory.createCallExpression(
                                  ts.factory.createPropertyAccessExpression(
                                    ts.factory.createIdentifier("queryClient"),
                                    ts.factory.createIdentifier(
                                      "invalidateQueries"
                                    )
                                  ),
                                  undefined,
                                  [
                                    ts.factory.createCallExpression(
                                      ts.factory.createPropertyAccessExpression(
                                        ts.factory.createIdentifier("queryIds"),
                                        ts.factory.createIdentifier(
                                          "getCustomer"
                                        )
                                      ),
                                      undefined,
                                      [
                                        ts.factory.createIdentifier(
                                          "customerId"
                                        ),
                                      ]
                                    ),
                                  ]
                                )
                              ),
                            ],
                            true
                          )
                        )
                      ),
                    ],
                    true
                  ),
                ]
              )
            ),
          ],
          true
        )
      )
    ),
  ];
  //#endregion

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
    /*name*/ ts.factory.createIdentifier("makeMutations"),
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

function makeQueryIds(queryIds: ReturnType<typeof parse>["queryIds"]) {
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

function makeInitialize() {
  const axios = ts.factory.createIdentifier("axios");

  const makeQueryIdsStatement = ts.factory.createVariableStatement(
    /*modifiers*/ undefined,
    /*declarationList*/ ts.factory.createVariableDeclarationList(
      /*declarations*/ [
        ts.factory.createVariableDeclaration(
          /*name*/ ts.factory.createIdentifier("queryIds"),
          /*exclamationToken*/ undefined,
          /*type*/ undefined,
          /*initializer*/ ts.factory.createCallExpression(
            /*expression*/ ts.factory.createIdentifier("makeQueryIds"),
            /*typeArgs*/ undefined,
            /*args*/ []
          )
        ),
      ],
      /*flags*/ ts.NodeFlags.Const
    )
  );

  const makeRequestsStatement = ts.factory.createVariableStatement(
    /*modifiers*/ undefined,
    /*declarationList*/ ts.factory.createVariableDeclarationList(
      /*declarations*/ [
        ts.factory.createVariableDeclaration(
          /*name*/ ts.factory.createIdentifier("requests"),
          /*exclamationToken*/ undefined,
          /*type*/ undefined,
          /*initializer*/ ts.factory.createCallExpression(
            /*expression*/ ts.factory.createIdentifier("makeRequests"),
            /*typeArgs*/ undefined,
            /*args*/ [axios]
          )
        ),
      ],
      /*flags*/ ts.NodeFlags.Const
    )
  );

  const returnStatement = ts.factory.createReturnStatement(
    ts.factory.createObjectLiteralExpression(
      /*properties*/ [
        ts.factory.createShorthandPropertyAssignment(
          /*name*/ ts.factory.createIdentifier("requests"),
          /*objectAssignmentInitializer*/ undefined
        ),
        ts.factory.createShorthandPropertyAssignment(
          /*name*/ ts.factory.createIdentifier("queryIds"),
          /*objectAssignmentInitializer*/ undefined
        ),
        ts.factory.createPropertyAssignment(
          ts.factory.createIdentifier("queries"),
          ts.factory.createCallExpression(
            ts.factory.createIdentifier("makeQueries"),
            undefined,
            [
              ts.factory.createIdentifier("requests"),
              ts.factory.createIdentifier("queryIds"),
            ]
          )
        ),
        ts.factory.createPropertyAssignment(
          ts.factory.createIdentifier("mutations"),
          ts.factory.createCallExpression(
            ts.factory.createIdentifier("makeMutations"),
            undefined,
            [
              ts.factory.createIdentifier("requests"),
              ts.factory.createIdentifier("queryIds"),
            ]
          )
        ),
      ],
      /*multiline*/ true
    )
  );

  const bodyStatements = [
    makeRequestsStatement,
    makeQueryIdsStatement,
    returnStatement,
  ];

  const parameter = ts.factory.createParameterDeclaration(
    /*decorators*/ undefined,
    /*modifiers*/ undefined,
    /*dotDotDotToken*/ undefined,
    /*name*/ axios,
    /*questionToken*/ undefined,
    /*type*/ ts.factory.createTypeReferenceNode(
      /*typeName*/ ts.factory.createIdentifier("AxiosInstance"),
      /*typeArgs*/ undefined
    ),
    /*initilizer*/ undefined
  );

  return ts.factory.createFunctionDeclaration(
    /*decorators*/ undefined,
    /*modifiers*/ [ts.factory.createToken(ts.SyntaxKind.ExportKeyword)],
    /*asteriskToken*/ undefined,
    /*name*/ ts.factory.createIdentifier("initialize"),
    /*typeParameters*/ undefined,
    /*parameters*/ [parameter],
    /*returnType*/ undefined,
    /*body*/ ts.factory.createBlock(bodyStatements, /*multiline*/ true)
  );
}

function makeTypes() {}

function makeSourceFile(data: ReturnType<typeof parse>) {
  return ts.factory.createSourceFile(
    /*statements*/ [
      makeImportReactQueryDeclartion(),
      makeImportAxiosInstanceTypeDeclaration(),
      makeType(),
      makeOtherType(),
      makeRequests(data.requests),
      makeQueries(),
      makeMutations(),
      makeQueryIds(data.queryIds),
      makeInitialize(),
    ],
    /*endOfFileToken*/ ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
    /*flags*/ ts.NodeFlags.None
  );
}

function makeSource(data: ReturnType<typeof parse>) {
  const resultFile = ts.createSourceFile(
    "client.ts",
    "",
    ts.ScriptTarget.Latest,
    /*setParentNodes*/ false,
    ts.ScriptKind.TS
  );
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

  const result = printer.printNode(
    ts.EmitHint.Unspecified,
    makeSourceFile(data),
    resultFile
  );

  return result;
}

export function generate(pathToOpenApiV3: string) {
  SwaggerParser.validate(pathToOpenApiV3, (err, api) => {
    if (err) {
      console.error(err);
      return;
    }

    console.log("API name: %s, Version: %s", api.info.title, api.info.version);
    const data = parse(api);

    const source = makeSource(data);
    print(source);
  });
}
