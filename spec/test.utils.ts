import ts from "typescript";

export function compile(statements: ts.Statement[]) {
  const resultFile = ts.createSourceFile(
    "client.ts",
    "",
    ts.ScriptTarget.Latest,
    /*setParentNodes*/ false,
    ts.ScriptKind.TS
  );
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

  const src = ts.factory.createSourceFile(
    /*statements*/ statements,
    /*endOfFileToken*/ ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
    /*flags*/ ts.NodeFlags.None
  );

  return printer.printNode(ts.EmitHint.Unspecified, src, resultFile);
}
