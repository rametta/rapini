import ts from "typescript";

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
        /*typeOnly*/ true,
        /*propertyName*/ undefined,
        /*name*/ ts.factory.createIdentifier("UseMutationOptions")
      ),
      ts.factory.createImportSpecifier(
        /*typeOnly*/ true,
        /*propertyName*/ undefined,
        /*name*/ ts.factory.createIdentifier("UseQueryOptions")
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

export function makeImports() {
  return [
    makeImportAxiosInstanceTypeDeclaration(),
    makeImportReactQueryDeclartion(),
  ];
}
