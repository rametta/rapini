import ts from "typescript";

export function makeInitialize() {
  const axios = ts.factory.createIdentifier("axios");

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
            /*args*/ [
              axios,
              ts.factory.createPropertyAccessChain(
                /*expression*/ ts.factory.createIdentifier("config"),
                /*questionDotToken*/ ts.factory.createToken(
                  ts.SyntaxKind.QuestionDotToken
                ),
                /*name*/ ts.factory.createIdentifier("axios")
              ),
            ]
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
        ts.factory.createPropertyAssignment(
          /*name*/ ts.factory.createIdentifier("queries"),
          /*initializer*/ ts.factory.createCallExpression(
            /*expression*/ ts.factory.createIdentifier("makeQueries"),
            /*typeArgs*/ undefined,
            /*args*/ [
              ts.factory.createIdentifier("requests"),
            ]
          )
        ),
      ],
      /*multiline*/ true
    )
  );

  const bodyStatements = [
    makeRequestsStatement,
    returnStatement,
  ];

  const axiosParameter = ts.factory.createParameterDeclaration(
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

  const configParameter = ts.factory.createParameterDeclaration(
    /*decorators*/ undefined,
    /*modifiers*/ undefined,
    /*dotDotDotToken*/ undefined,
    /*name*/ ts.factory.createIdentifier("config"),
    /*questionToken*/ ts.factory.createToken(ts.SyntaxKind.QuestionToken),
    /*type*/ ts.factory.createTypeReferenceNode(
      /*typeName*/ ts.factory.createIdentifier("Config"),
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
    /*parameters*/ [axiosParameter, configParameter],
    /*returnType*/ undefined,
    /*body*/ ts.factory.createBlock(bodyStatements, /*multiline*/ true)
  );
}
