import ts from "typescript";
import {
  capitalizeFirstLetter,
  combineUniqueParams,
  lowercaseFirstLetter,
  normalizeOperationId,
  refToTypeName,
  nodeId,
} from "../../src/common/util";

describe("capitalizeFirstLetter", () => {
  it.each`
    str        | expected
    ${""}      | ${""}
    ${"hello"} | ${"Hello"}
    ${"Hello"} | ${"Hello"}
    ${"HEllo"} | ${"HEllo"}
  `("capitalizeFirstLetter($str) -> $expected", ({ str, expected }) => {
    expect(capitalizeFirstLetter(str)).toBe(expected);
  });
});

describe("lowercaseFirstLetter", () => {
  it.each`
    str        | expected
    ${""}      | ${""}
    ${"hello"} | ${"hello"}
    ${"Hello"} | ${"hello"}
    ${"HEllo"} | ${"hEllo"}
  `("lowercaseFirstLetter($str) -> $expected", ({ str, expected }) => {
    expect(lowercaseFirstLetter(str)).toBe(expected);
  });
});

describe("normalizeOperationId", () => {
  it.each`
    str                          | expected
    ${""}                        | ${""}
    ${"helloGoodbye"}            | ${"helloGoodbye"}
    ${"test1-test8-test1_test2"} | ${"test1Test8Test1Test2"}
    ${"Test1_test8-test1_test2"} | ${"test1Test8Test1Test2"}
  `("normalizeOperationId($str) -> $expected", ({ str, expected }) => {
    expect(normalizeOperationId(str)).toBe(expected);
  });
});

describe("refToTypeName", () => {
  it.each`
    str                                        | expected
    ${""}                                      | ${""}
    ${"#/components/schemas/MySchema"}         | ${"MySchema"}
    ${"#/components/schemas/Pet"}              | ${"Pet"}
    ${"#/components/responses/MyRes"}          | ${"MyRes"}
    ${"#/components/schemas/MyRes.Hello"}      | ${"MyResHello"}
    ${"#/components/schemas/MyRes.Hello.Test"} | ${"MyResHelloTest"}
    ${"#/components/schemas/MyRes-Hello"}      | ${"MyResHello"}
    ${"#/components/schemas/myRes.hello-test"} | ${"MyResHelloTest"}
  `("refToTypeName($str) -> $expected", ({ str, expected }) => {
    expect(refToTypeName(str)).toBe(expected);
  });
});

describe("combineUniqueParams", () => {
  it.each`
    pathParams                      | itemParams                                                 | expected
    ${[]}                           | ${[]}                                                      | ${[]}
    ${[]}                           | ${[{ name: "a", in: "query" }]}                            | ${[{ name: "a", in: "query" }]}
    ${[{ name: "a", in: "path" }]}  | ${[]}                                                      | ${[{ name: "a", in: "path" }]}
    ${[{ name: "a", in: "path" }]}  | ${[{ name: "a", in: "query" }]}                            | ${[{ name: "a", in: "query" }, { name: "a", in: "path" }]}
    ${[{ name: "a", in: "query" }]} | ${[{ name: "a", in: "query" }, { name: "b", in: "path" }]} | ${[{ name: "a", in: "query" }, { name: "b", in: "path" }]}
  `(
    "combineUniqueParams($pathParams, $itemParams) -> $expected",
    ({ pathParams, itemParams, expected }) => {
      expect(
        combineUniqueParams({} as any, pathParams, itemParams)
      ).toStrictEqual(expected);
    }
  );
});

describe("nodeId", () => {
  const numeric = ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
  const string = ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
  const bool = ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword);
  const any = ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
  const ref = ts.factory.createTypeReferenceNode("MyTypeName");
  const union = ts.factory.createUnionTypeNode([numeric, string, ref]);
  const arr = ts.factory.createArrayTypeNode(union);
  const literal = ts.factory.createTypeLiteralNode([
    ts.factory.createPropertySignature(
      undefined,
      ts.factory.createIdentifier("hello"),
      undefined,
      ts.factory.createLiteralTypeNode(ts.factory.createNumericLiteral("6"))
    ),
    ts.factory.createPropertySignature(
      undefined,
      ts.factory.createIdentifier("world"),
      undefined,
      ts.factory.createLiteralTypeNode(ts.factory.createTrue())
    ),
  ]);

  it.each`
    node       | expected
    ${numeric} | ${"147"}
    ${string}  | ${"150"}
    ${bool}    | ${"133"}
    ${any}     | ${"130"}
    ${union}   | ${"147|150|MyTypeName"}
    ${arr}     | ${"Array<(147|150|MyTypeName)>"}
    ${ref}     | ${"MyTypeName"}
    ${literal} | ${"type-literal-hello&world"}
  `("nodeId($node) -> $expected", ({ node, expected }) => {
    expect(nodeId(node)).toStrictEqual(expected);
  });
});
