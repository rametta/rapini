import ts from "typescript";

export const RAPINI_MUTATION_ID = "useRapiniMutation";

export function makeRapiniMutation() {
  return ts.factory.createFunctionDeclaration(
    undefined,
    undefined,
    undefined,
    ts.factory.createIdentifier(RAPINI_MUTATION_ID),
    [
      ts.factory.createTypeParameterDeclaration(
        undefined,
        ts.factory.createIdentifier("TData"),
        undefined,
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
      ),
      ts.factory.createTypeParameterDeclaration(
        undefined,
        ts.factory.createIdentifier("TError"),
        undefined,
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
      ),
      ts.factory.createTypeParameterDeclaration(
        undefined,
        ts.factory.createIdentifier("TVariables"),
        undefined,
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword)
      ),
      ts.factory.createTypeParameterDeclaration(
        undefined,
        ts.factory.createIdentifier("TContext"),
        undefined,
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
      ),
    ],
    [
      ts.factory.createParameterDeclaration(
        undefined,
        undefined,
        undefined,
        ts.factory.createIdentifier("mutationFn"),
        undefined,
        ts.factory.createTypeReferenceNode(
          ts.factory.createIdentifier("MutationFunction"),
          [
            ts.factory.createTypeReferenceNode(
              ts.factory.createIdentifier("TData"),
              undefined
            ),
            ts.factory.createTypeReferenceNode(
              ts.factory.createIdentifier("TVariables"),
              undefined
            ),
          ]
        ),
        undefined
      ),
      ts.factory.createParameterDeclaration(
        undefined,
        undefined,
        undefined,
        ts.factory.createIdentifier("config"),
        ts.factory.createToken(ts.SyntaxKind.QuestionToken),
        ts.factory.createFunctionTypeNode(
          undefined,
          [
            ts.factory.createParameterDeclaration(
              undefined,
              undefined,
              undefined,
              ts.factory.createIdentifier("queryClient"),
              undefined,
              ts.factory.createTypeReferenceNode(
                ts.factory.createIdentifier("QueryClient"),
                undefined
              ),
              undefined
            ),
          ],
          ts.factory.createTypeReferenceNode(
            ts.factory.createIdentifier("Pick"),
            [
              ts.factory.createTypeReferenceNode(
                ts.factory.createIdentifier("UseMutationOptions"),
                [
                  ts.factory.createTypeReferenceNode(
                    ts.factory.createIdentifier("TData"),
                    undefined
                  ),
                  ts.factory.createTypeReferenceNode(
                    ts.factory.createIdentifier("TError"),
                    undefined
                  ),
                  ts.factory.createTypeReferenceNode(
                    ts.factory.createIdentifier("TVariables"),
                    undefined
                  ),
                  ts.factory.createTypeReferenceNode(
                    ts.factory.createIdentifier("TContext"),
                    undefined
                  ),
                ]
              ),
              ts.factory.createUnionTypeNode([
                ts.factory.createLiteralTypeNode(
                  ts.factory.createStringLiteral("onSuccess")
                ),
                ts.factory.createLiteralTypeNode(
                  ts.factory.createStringLiteral("onSettled")
                ),
                ts.factory.createLiteralTypeNode(
                  ts.factory.createStringLiteral("onError")
                ),
              ]),
            ]
          )
        ),
        undefined
      ),
      ts.factory.createParameterDeclaration(
        undefined,
        undefined,
        undefined,
        ts.factory.createIdentifier("options"),
        ts.factory.createToken(ts.SyntaxKind.QuestionToken),
        ts.factory.createTypeReferenceNode(
          ts.factory.createIdentifier("Omit"),
          [
            ts.factory.createTypeReferenceNode(
              ts.factory.createIdentifier("UseMutationOptions"),
              [
                ts.factory.createTypeReferenceNode(
                  ts.factory.createIdentifier("TData"),
                  undefined
                ),
                ts.factory.createTypeReferenceNode(
                  ts.factory.createIdentifier("TError"),
                  undefined
                ),
                ts.factory.createTypeReferenceNode(
                  ts.factory.createIdentifier("TVariables"),
                  undefined
                ),
                ts.factory.createTypeReferenceNode(
                  ts.factory.createIdentifier("TContext"),
                  undefined
                ),
              ]
            ),
            ts.factory.createLiteralTypeNode(
              ts.factory.createStringLiteral("mutationFn")
            ),
          ]
        ),
        undefined
      ),
    ],
    ts.factory.createTypeReferenceNode(
      ts.factory.createIdentifier("UseMutationResult"),
      [
        ts.factory.createTypeReferenceNode(
          ts.factory.createIdentifier("TData"),
          undefined
        ),
        ts.factory.createTypeReferenceNode(
          ts.factory.createIdentifier("TError"),
          undefined
        ),
        ts.factory.createTypeReferenceNode(
          ts.factory.createIdentifier("TVariables"),
          undefined
        ),
        ts.factory.createTypeReferenceNode(
          ts.factory.createIdentifier("TContext"),
          undefined
        ),
      ]
    ),
    ts.factory.createBlock(
      [
        ts.factory.createVariableStatement(
          undefined,
          ts.factory.createVariableDeclarationList(
            [
              ts.factory.createVariableDeclaration(
                ts.factory.createObjectBindingPattern([
                  ts.factory.createBindingElement(
                    undefined,
                    undefined,
                    ts.factory.createIdentifier("onSuccess"),
                    undefined
                  ),
                  ts.factory.createBindingElement(
                    undefined,
                    undefined,
                    ts.factory.createIdentifier("onError"),
                    undefined
                  ),
                  ts.factory.createBindingElement(
                    undefined,
                    undefined,
                    ts.factory.createIdentifier("onSettled"),
                    undefined
                  ),
                  ts.factory.createBindingElement(
                    ts.factory.createToken(ts.SyntaxKind.DotDotDotToken),
                    undefined,
                    ts.factory.createIdentifier("rest"),
                    undefined
                  ),
                ]),
                undefined,
                undefined,
                ts.factory.createBinaryExpression(
                  ts.factory.createIdentifier("options"),
                  ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                  ts.factory.createObjectLiteralExpression([], false)
                )
              ),
            ],
            ts.NodeFlags.Const
          )
        ),
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
        ts.factory.createVariableStatement(
          undefined,
          ts.factory.createVariableDeclarationList(
            [
              ts.factory.createVariableDeclaration(
                ts.factory.createIdentifier("conf"),
                undefined,
                undefined,
                ts.factory.createCallChain(
                  ts.factory.createIdentifier("config"),
                  ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                  undefined,
                  [ts.factory.createIdentifier("queryClient")]
                )
              ),
            ],
            ts.NodeFlags.Const
          )
        ),
        ts.factory.createVariableStatement(
          undefined,
          ts.factory.createVariableDeclarationList(
            [
              ts.factory.createVariableDeclaration(
                ts.factory.createIdentifier("mutationOptions"),
                undefined,
                ts.factory.createTypeQueryNode(
                  ts.factory.createIdentifier("options"),
                  undefined
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
                            ts.factory.createIdentifier("data"),
                            undefined,
                            ts.factory.createTypeReferenceNode(
                              ts.factory.createIdentifier("TData"),
                              undefined
                            ),
                            undefined
                          ),
                          ts.factory.createParameterDeclaration(
                            undefined,
                            undefined,
                            undefined,
                            ts.factory.createIdentifier("variables"),
                            undefined,
                            ts.factory.createTypeReferenceNode(
                              ts.factory.createIdentifier("TVariables"),
                              undefined
                            ),
                            undefined
                          ),
                          ts.factory.createParameterDeclaration(
                            undefined,
                            undefined,
                            undefined,
                            ts.factory.createIdentifier("context"),
                            ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                            ts.factory.createTypeReferenceNode(
                              ts.factory.createIdentifier("TContext"),
                              undefined
                            ),
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
                              ts.factory.createCallChain(
                                ts.factory.createPropertyAccessChain(
                                  ts.factory.createIdentifier("conf"),
                                  ts.factory.createToken(
                                    ts.SyntaxKind.QuestionDotToken
                                  ),
                                  ts.factory.createIdentifier("onSuccess")
                                ),
                                ts.factory.createToken(
                                  ts.SyntaxKind.QuestionDotToken
                                ),
                                undefined,
                                [
                                  ts.factory.createIdentifier("data"),
                                  ts.factory.createIdentifier("variables"),
                                  ts.factory.createIdentifier("context"),
                                ]
                              )
                            ),
                            ts.factory.createExpressionStatement(
                              ts.factory.createCallChain(
                                ts.factory.createIdentifier("onSuccess"),
                                ts.factory.createToken(
                                  ts.SyntaxKind.QuestionDotToken
                                ),
                                undefined,
                                [
                                  ts.factory.createIdentifier("data"),
                                  ts.factory.createIdentifier("variables"),
                                  ts.factory.createIdentifier("context"),
                                ]
                              )
                            ),
                          ],
                          true
                        )
                      )
                    ),
                    ts.factory.createPropertyAssignment(
                      ts.factory.createIdentifier("onError"),
                      ts.factory.createArrowFunction(
                        undefined,
                        undefined,
                        [
                          ts.factory.createParameterDeclaration(
                            undefined,
                            undefined,
                            undefined,
                            ts.factory.createIdentifier("error"),
                            undefined,
                            ts.factory.createTypeReferenceNode(
                              ts.factory.createIdentifier("TError"),
                              undefined
                            ),
                            undefined
                          ),
                          ts.factory.createParameterDeclaration(
                            undefined,
                            undefined,
                            undefined,
                            ts.factory.createIdentifier("variables"),
                            undefined,
                            ts.factory.createTypeReferenceNode(
                              ts.factory.createIdentifier("TVariables"),
                              undefined
                            ),
                            undefined
                          ),
                          ts.factory.createParameterDeclaration(
                            undefined,
                            undefined,
                            undefined,
                            ts.factory.createIdentifier("context"),
                            ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                            ts.factory.createTypeReferenceNode(
                              ts.factory.createIdentifier("TContext"),
                              undefined
                            ),
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
                              ts.factory.createCallChain(
                                ts.factory.createPropertyAccessChain(
                                  ts.factory.createIdentifier("conf"),
                                  ts.factory.createToken(
                                    ts.SyntaxKind.QuestionDotToken
                                  ),
                                  ts.factory.createIdentifier("onError")
                                ),
                                ts.factory.createToken(
                                  ts.SyntaxKind.QuestionDotToken
                                ),
                                undefined,
                                [
                                  ts.factory.createIdentifier("error"),
                                  ts.factory.createIdentifier("variables"),
                                  ts.factory.createIdentifier("context"),
                                ]
                              )
                            ),
                            ts.factory.createExpressionStatement(
                              ts.factory.createCallChain(
                                ts.factory.createIdentifier("onError"),
                                ts.factory.createToken(
                                  ts.SyntaxKind.QuestionDotToken
                                ),
                                undefined,
                                [
                                  ts.factory.createIdentifier("error"),
                                  ts.factory.createIdentifier("variables"),
                                  ts.factory.createIdentifier("context"),
                                ]
                              )
                            ),
                          ],
                          true
                        )
                      )
                    ),
                    ts.factory.createPropertyAssignment(
                      ts.factory.createIdentifier("onSettled"),
                      ts.factory.createArrowFunction(
                        undefined,
                        undefined,
                        [
                          ts.factory.createParameterDeclaration(
                            undefined,
                            undefined,
                            undefined,
                            ts.factory.createIdentifier("data"),
                            undefined,
                            ts.factory.createUnionTypeNode([
                              ts.factory.createTypeReferenceNode(
                                ts.factory.createIdentifier("TData"),
                                undefined
                              ),
                              ts.factory.createKeywordTypeNode(
                                ts.SyntaxKind.UndefinedKeyword
                              ),
                            ]),
                            undefined
                          ),
                          ts.factory.createParameterDeclaration(
                            undefined,
                            undefined,
                            undefined,
                            ts.factory.createIdentifier("error"),
                            undefined,
                            ts.factory.createUnionTypeNode([
                              ts.factory.createTypeReferenceNode(
                                ts.factory.createIdentifier("TError"),
                                undefined
                              ),
                              ts.factory.createLiteralTypeNode(
                                ts.factory.createNull()
                              ),
                            ]),
                            undefined
                          ),
                          ts.factory.createParameterDeclaration(
                            undefined,
                            undefined,
                            undefined,
                            ts.factory.createIdentifier("variables"),
                            undefined,
                            ts.factory.createTypeReferenceNode(
                              ts.factory.createIdentifier("TVariables"),
                              undefined
                            ),
                            undefined
                          ),
                          ts.factory.createParameterDeclaration(
                            undefined,
                            undefined,
                            undefined,
                            ts.factory.createIdentifier("context"),
                            ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                            ts.factory.createTypeReferenceNode(
                              ts.factory.createIdentifier("TContext"),
                              undefined
                            ),
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
                              ts.factory.createCallChain(
                                ts.factory.createPropertyAccessChain(
                                  ts.factory.createIdentifier("conf"),
                                  ts.factory.createToken(
                                    ts.SyntaxKind.QuestionDotToken
                                  ),
                                  ts.factory.createIdentifier("onSettled")
                                ),
                                ts.factory.createToken(
                                  ts.SyntaxKind.QuestionDotToken
                                ),
                                undefined,
                                [
                                  ts.factory.createIdentifier("data"),
                                  ts.factory.createIdentifier("error"),
                                  ts.factory.createIdentifier("variables"),
                                  ts.factory.createIdentifier("context"),
                                ]
                              )
                            ),
                            ts.factory.createExpressionStatement(
                              ts.factory.createCallChain(
                                ts.factory.createIdentifier("onSettled"),
                                ts.factory.createToken(
                                  ts.SyntaxKind.QuestionDotToken
                                ),
                                undefined,
                                [
                                  ts.factory.createIdentifier("data"),
                                  ts.factory.createIdentifier("error"),
                                  ts.factory.createIdentifier("variables"),
                                  ts.factory.createIdentifier("context"),
                                ]
                              )
                            ),
                          ],
                          true
                        )
                      )
                    ),
                    ts.factory.createSpreadAssignment(
                      ts.factory.createIdentifier("rest")
                    ),
                  ],
                  true
                )
              ),
            ],
            ts.NodeFlags.Const
          )
        ),
        ts.factory.createReturnStatement(
          ts.factory.createCallExpression(
            ts.factory.createIdentifier("useMutation"),
            undefined,
            [
              ts.factory.createObjectLiteralExpression(
                [
                  ts.factory.createShorthandPropertyAssignment(
                    ts.factory.createIdentifier("mutationFn"),
                    undefined
                  ),
                  ts.factory.createSpreadAssignment(
                    ts.factory.createIdentifier("mutationOptions")
                  ),
                ],
                false
              ),
            ]
          )
        ),
      ],
      true
    )
  );
}
