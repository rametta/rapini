import type { OpenAPIV3 } from "openapi-types";
import { makeQueryKeys } from "../../src/common/queryKeys";
import { compile } from "../test.utils";

const expected = `function nullIfUndefined<T>(value: T): NonNullable<T> | null {
    return typeof value === "undefined" ? null : value as NonNullable<T> | null;
}
export const queryKeys = {
    getPets: () => ["getPets"] as const,
    getPet: (petId?: string) => ["getPet", nullIfUndefined(petId)] as const,
    getPetPhotos: (petId: string) => ["getPetPhotos", petId] as const
} as const;
export type QueryKeys = typeof queryKeys;
`;

describe("makeQueryKeys", () => {
  it("generates queryKeys for every GET path", () => {
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
                      $ref: "",
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
              default: {
                description: "anything",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "",
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
                      $ref: "",
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
                      $ref: "",
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
                    $ref: "",
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
                      $ref: "",
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    const str = compile(makeQueryKeys({} as any, doc.paths));
    expect(str).toBe(expected);
  });
});
