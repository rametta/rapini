import {
  capitalizeFirstLetter,
  lowercaseFirstLetter,
  normalizeOperationId,
  refToTypeName,
} from "./../src/common";

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
    ${"#/components/responses/MyRes"}          | ${"#/components/responses/MyRes"}
    ${"#/components/schemas/MyRes.Hello"}      | ${"MyResHello"}
    ${"#/components/schemas/MyRes.Hello.Test"} | ${"MyResHelloTest"}
    ${"#/components/schemas/MyRes-Hello"}      | ${"MyResHello"}
    ${"#/components/schemas/myRes.hello-test"} | ${"MyResHelloTest"}
  `("refToTypeName($str) -> $expected", ({ str, expected }) => {
    expect(refToTypeName(str)).toBe(expected);
  });
});
