import ts from "typescript";
import type { OpenAPIV3 } from "openapi-types";
import {
  chunker,
  replacePattern,
  patternToPath,
  makeRequests,
} from "../../src/common/requests";
import { compile } from "../test.utils";

const expected = `function makeRequests(axios: AxiosInstance, config?: AxiosConfig) {
    return {
        getPets: () => axios.request<Pets>({
            method: "get",
            url: \`/pets\`
        }).then(res => res.data),
        createPet: (payload: unknown) => axios.request<Pet>({
            method: "post",
            url: \`/pets\`,
            data: payload
        }).then(res => res.data),
        getPet: (petId?: string) => axios.request<Pet>({
            method: "get",
            url: \`/pets/\${petId}\`
        }).then(res => res.data),
        getPetGeneric: (petId?: string) => axios.request<(PetDog | PetCat)[]>({
            method: "get",
            url: \`/pets/\${petId}/generic\`
        }).then(res => res.data),
        getPetPhotos: (petId: string) => axios.request<Photos>({
            method: "get",
            url: \`/pets/\${petId}/photos\`
        }).then(res => res.data),
        addPetPhoto: (payload: Photos, petId: string) => axios.request<Photos>({
            method: "post",
            url: \`/pets/\${petId}/photos\`,
            data: payload
        }).then(res => res.data)
    } as const;
}
export type Requests = ReturnType<typeof makeRequests>;
export type Response<T extends keyof Requests> = Awaited<ReturnType<Requests[T]>>;
`;

describe("makeRequests", () => {
  it("generates requests for every path", () => {
    const doc: OpenAPIV3.Document = {
      openapi: "3.0.0",
      info: {
        title: "Test",
        version: "1.0.0",
      },
      paths: {
        "/pets": {
          get: {
            operationId: "getPets",
            responses: {
              default: {
                description: "anything",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/Pets",
                    },
                  },
                },
              },
            },
          },
          post: {
            operationId: "createPet",
            requestBody: {
              description: "anything",
              content: {
                "application/json": {
                  schema: {
                    $ref: "",
                  },
                },
              },
            },
            responses: {
              200: {
                description: "anything",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/Pet",
                    },
                  },
                },
              },
            },
          },
        },
        "/pets/{petId}": {
          get: {
            operationId: "getPet",
            parameters: [
              {
                name: "petId",
                in: "path",
                required: false,
                schema: {
                  type: "string",
                },
              },
            ],
            responses: {
              default: {
                description: "anything",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/Pet",
                    },
                  },
                },
              },
            },
          },
        },
        "/pets/{petId}/generic": {
          get: {
            operationId: "getPetGeneric",
            parameters: [
              {
                name: "petId",
                in: "path",
                required: false,
                schema: {
                  type: "string",
                },
              },
            ],
            responses: {
              "200": {
                description: "some",
                content: {
                  "application/json": {
                    schema: {
                      type: "array",
                      items: {
                        oneOf: [
                          {
                            $ref: "#/components/schemas/Pet.Dog",
                          },
                          {
                            $ref: "#/components/schemas/Pet.Cat",
                          },
                        ],
                      },
                    },
                  },
                },
              },
            },
          },
        },
        "/pets/{petId}/photos": {
          parameters: [
            {
              name: "petId",
              in: "path",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          get: {
            operationId: "getPetPhotos",
            responses: {
              default: {
                description: "anything",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/Photos",
                    },
                  },
                },
              },
            },
          },
          post: {
            operationId: "addPetPhoto",
            requestBody: {
              description: "anything",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Photos",
                  },
                },
              },
            },
            responses: {
              default: {
                description: "anything",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/Photos",
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    const str = compile(makeRequests({} as any, doc.paths, {} as any));
    expect(str).toBe(expected);
  });
});

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
