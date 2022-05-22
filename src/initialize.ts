import ts from "typescript";

export function makeInitialize() {
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
