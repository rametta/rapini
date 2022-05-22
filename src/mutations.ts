import ts from "typescript";

export function makeMutations() {
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
