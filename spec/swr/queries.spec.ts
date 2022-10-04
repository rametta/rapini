import type { OpenAPIV3 } from "openapi-types";
import { makeQueries } from "../../src/swr/queries";
import { compile } from "../test.utils";

const expected = `function makeQueries(requests: ReturnType<typeof makeRequests>, queryIds: ReturnType<typeof makeQueryIds>) {
    return {
        useGetPets: (options?: SWRConfiguration<Awaited<ReturnType<typeof requests.getPets>>, unknown>): SWRResponse<Awaited<ReturnType<typeof requests.getPets>>, unknown> => useSWR(queryIds.getPets(), () => requests.getPets(), options),
        useGetPet: (petId: string, options?: SWRConfiguration<Awaited<ReturnType<typeof requests.getPet>>, unknown>): SWRResponse<Awaited<ReturnType<typeof requests.getPet>>, unknown> => useSWR(queryIds.getPet(petId), () => requests.getPet(petId), options),
        useGetPetPhotos: (petId: string, options?: SWRConfiguration<Awaited<ReturnType<typeof requests.getPetPhotos>>, unknown>): SWRResponse<Awaited<ReturnType<typeof requests.getPetPhotos>>, unknown> => useSWR(queryIds.getPetPhotos(petId), () => requests.getPetPhotos(petId), options)
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
