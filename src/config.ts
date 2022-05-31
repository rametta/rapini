import ts from "typescript";

export function makeConfigTypes() {
  return [
    ts.factory.createTypeAliasDeclaration(
      /*decorators*/ undefined,
      /*modifiers*/ [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      /*name*/ ts.factory.createIdentifier("AxiosConfig"),
      /*typeParameters*/ undefined,
      /*type*/ ts.factory.createTypeLiteralNode([
        ts.factory.createPropertySignature(
          /*modifiers*/ undefined,
          /*name*/ ts.factory.createIdentifier("paramsSerializer"),
          /*questionToken*/ ts.factory.createToken(ts.SyntaxKind.QuestionToken),
          /*type*/ ts.factory.createIndexedAccessTypeNode(
            /*objectType*/ ts.factory.createTypeReferenceNode(
              /*typeName*/ ts.factory.createIdentifier("AxiosRequestConfig"),
              /*typeArguments*/ undefined
            ),
            /*indexType*/ ts.factory.createLiteralTypeNode(
              /*literal*/ ts.factory.createStringLiteral("paramsSerializer")
            )
          )
        ),
      ])
    ),
    ts.factory.createTypeAliasDeclaration(
      /*decorators*/ undefined,
      /*modifiers*/ [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      /*name*/ ts.factory.createIdentifier("Config"),
      /*typeParameters*/ undefined,
      /*type*/ ts.factory.createTypeLiteralNode([
        ts.factory.createPropertySignature(
          /*modifiers*/ undefined,
          /*name*/ ts.factory.createIdentifier("mutations"),
          /*questionToken*/ ts.factory.createToken(ts.SyntaxKind.QuestionToken),
          /*type*/ ts.factory.createTypeReferenceNode(
            /*typeName*/ ts.factory.createIdentifier("MutationConfigs"),
            /*typeArguments*/ undefined
          )
        ),
        ts.factory.createPropertySignature(
          /*modifiers*/ undefined,
          /*name*/ ts.factory.createIdentifier("axios"),
          /*questionToken*/ ts.factory.createToken(ts.SyntaxKind.QuestionToken),
          /*type*/ ts.factory.createTypeReferenceNode(
            /*typeName*/ ts.factory.createIdentifier("AxiosConfig"),
            /*typeArguments*/ undefined
          )
        ),
      ])
    ),
  ];
}
