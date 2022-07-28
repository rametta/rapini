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
        ts.factory.createImportSpecifier(
          /*isTypeOnly*/ false,
          /*propertyName*/ undefined,
          /*name*/ ts.factory.createIdentifier("AxiosRequestConfig")
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
      ts.factory.createImportSpecifier(
        /*typeOnly*/ true,
        /*propertyName*/ undefined,
        /*name*/ ts.factory.createIdentifier("QueryClient")
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
      ts.factory.createImportSpecifier(
        /*typeOnly*/ true,
        /*propertyName*/ undefined,
        /*name*/ ts.factory.createIdentifier("MutationFunction")
      ),
      ts.factory.createImportSpecifier(
        /*typeOnly*/ true,
        /*propertyName*/ undefined,
        /*name*/ ts.factory.createIdentifier("UseMutationResult")
      ),
      ts.factory.createImportSpecifier(
        /*typeOnly*/ true,
        /*propertyName*/ undefined,
        /*name*/ ts.factory.createIdentifier("UseQueryResult")
      ),
    ])
  );

  return ts.factory.createImportDeclaration(
    /*decorators*/ undefined,
    /*modifers*/ undefined,
    /*importClause*/ importClause,
    /*moduleSpecifier*/ ts.factory.createStringLiteral("@tanstack/react-query"),
    /*assertClause*/ undefined
  );
}

export function makeImports() {
  return [
    makeImportAxiosInstanceTypeDeclaration(),
    makeImportReactQueryDeclartion(),
  ];
}
