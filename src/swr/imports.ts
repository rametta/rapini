import ts from "typescript";

function makeImportAxiosInstanceTypeDeclaration() {
  return ts.factory.createImportDeclaration(
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

function makeImportSWRDeclaration() {
  return ts.factory.createImportDeclaration(
    /*modifiers*/ undefined,
    /*importClause*/ ts.factory.createImportClause(
      /*typeOnly*/ false,
      /*name*/ ts.factory.createIdentifier("useSWR"),
      /*namedBindings*/ ts.factory.createNamedImports([
        ts.factory.createImportSpecifier(
          /*typeOnly*/ true,
          /*propertyName*/ undefined,
          /*name*/ ts.factory.createIdentifier("SWRConfiguration")
        ),
        ts.factory.createImportSpecifier(
          /*typeOnly*/ true,
          /*propertyName*/ undefined,
          /*name*/ ts.factory.createIdentifier("SWRResponse")
        ),
      ])
    ),
    /*moduleSpecifier*/ ts.factory.createStringLiteral("swr"),
    /*assertClause*/ undefined
  );
}

export function makeImports() {
  return [makeImportAxiosInstanceTypeDeclaration(), makeImportSWRDeclaration()];
}
