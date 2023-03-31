import type { OpenAPIV3 } from "openapi-types";
import { makeQueries } from "../../src/react-query/queries";
import { compile } from "../test.utils";

const expected = `function makeQueries(requests: Requests) {
    return {
        useGetPets: (options?: Omit<UseQueryOptions<Response<"getPets">, unknown, Response<"getPets">, ReturnType<QueryKeys["getPets"]>>, "queryKey" | "queryFn">): UseQueryResult<Response<"getPets">, unknown> => useQuery(queryKeys.getPets(), () => requests.getPets(), options),
        useGetPet: (petId: string, options?: Omit<UseQueryOptions<Response<"getPet">, unknown, Response<"getPet">, ReturnType<QueryKeys["getPet"]>>, "queryKey" | "queryFn">): UseQueryResult<Response<"getPet">, unknown> => useQuery(queryKeys.getPet(petId), () => requests.getPet(petId), options),
        useGetPetPhotos: (petId: string, options?: Omit<UseQueryOptions<Response<"getPetPhotos">, unknown, Response<"getPetPhotos">, ReturnType<QueryKeys["getPetPhotos"]>>, "queryKey" | "queryFn">): UseQueryResult<Response<"getPetPhotos">, unknown> => useQuery(queryKeys.getPetPhotos(petId), () => requests.getPetPhotos(petId), options)
    } as const;
}
`;

describe("makeQueries", () => {
  it("generates queries for every GET path", () => {
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
                required: true,
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

    const str = compile([makeQueries(doc.paths)]);
    expect(str).toBe(expected);
  });
});
