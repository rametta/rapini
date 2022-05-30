import ts from "typescript";

export function makeConfigType() {
  return ts.factory.createTypeAliasDeclaration(
    /*decorators*/ undefined,
    /*modifiers*/ [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    /*name*/ ts.factory.createIdentifier("Config"),
    /*typeParameters*/ undefined,
    /*type*/ ts.factory.createTypeLiteralNode([
      ts.factory.createPropertySignature(
        /*modifiers*/ undefined,
        /*name*/ ts.factory.createIdentifier("mutations"),
        /*questionToken*/ undefined,
        /*type*/ ts.factory.createTypeReferenceNode(
          /*typeName*/ ts.factory.createIdentifier("MutationConfigs"),
          /*typeArgs*/ undefined
        )
      ),
    ])
  );
}
