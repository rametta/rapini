import ts from "typescript";
import { chunker, replacePattern, patternToPath } from "../src/requests";
import { compile } from "./test.utils";

describe("chunker", () => {
  it.each`
    arr                      | chunkSize | expected
    ${[1, 2, 3, 4]}          | ${2}      | ${[[1, 2], [3, 4]]}
    ${[1, 2, 3, 4, 5, 6]}    | ${2}      | ${[[1, 2], [3, 4], [5, 6]]}
    ${[1, 2, 3, 4, 5, 6]}    | ${3}      | ${[[1, 2, 3], [4, 5, 6]]}
    ${[1, 2, 3, 4, 5, 6, 7]} | ${3}      | ${[[1, 2, 3], [4, 5, 6], [7]]}
    ${[1, 2]}                | ${2}      | ${[[1, 2]]}
    ${[]}                    | ${2}      | ${[]}
  `(
    "chunker($arr, $chunkSize) -> $expected",
    ({ arr, chunkSize, expected }) => {
      expect(chunker(arr, chunkSize)).toStrictEqual(expected);
    }
  );
});

describe("replacePattern", () => {
  it.each`
    pattern               | replacers                                         | expected
    ${"/api/v1/hello"}    | ${["/api", "/ipa"]}                               | ${"/ipa/v1/hello"}
    ${"/api/v1/v1/hello"} | ${["/v1", "/v2", "hello", "goodbye"]}             | ${"/api/v2/v2/goodbye"}
    ${"/api/v1/v1/hello"} | ${["/v1", "/v2", "hello", "goodbye", "anything"]} | ${"/api/v2/v2/goodbye"}
  `(
    "replacePattern($pattern, $replacers) -> $expected",
    ({ pattern, replacers, expected }) => {
      expect(replacePattern(pattern, replacers)).toBe(expected);
    }
  );
});

describe("patternToPath", () => {
  it.each`
    pattern                 | baseUrl               | replacers                                         | expected
    ${"/api/v1/hello"}      | ${""}                 | ${["/api", "/ipa"]}                               | ${"var x = `/ipa/v1/hello`;\n"}
    ${"/api/v1/v1/hello"}   | ${"https://test.com"} | ${["/v1", "/v2", "hello", "goodbye"]}             | ${"var x = `https://test.com/api/v2/v2/goodbye`;\n"}
    ${"/api/v1/v1/hello"}   | ${""}                 | ${["/v1", "/v2", "hello", "goodbye", "anything"]} | ${"var x = `/api/v2/v2/goodbye`;\n"}
    ${"/api/{id}"}          | ${""}                 | ${[]}                                             | ${"var x = `/api/${id}`;\n"}
    ${"/api/{id}/x/{some}"} | ${""}                 | ${["/api", "/ipa"]}                               | ${"var x = `/ipa/${id}/x/${some}`;\n"}
  `(
    "patternToPath($pattern, $baseUrl, $replacers) -> $expected",
    ({ pattern, baseUrl, replacers, expected }) => {
      const templateString = patternToPath(pattern, baseUrl, replacers);
      const statement = ts.factory.createVariableStatement(
        undefined,
        ts.factory.createVariableDeclarationList(
          [
            ts.factory.createVariableDeclaration(
              ts.factory.createIdentifier("x"),
              undefined,
              undefined,
              templateString
            ),
          ],
          ts.NodeFlags.None
        )
      );
      const actual = compile([statement]);
      expect(actual).toBe(expected);
    }
  );
});
