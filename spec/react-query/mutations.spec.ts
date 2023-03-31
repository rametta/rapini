import type { OpenAPIV3 } from "openapi-types";
import { makeMutations } from "../../src/react-query/mutations";
import { compile } from "../test.utils";

const expected = `type MutationConfigs = {
    useCreatePet?: (queryClient: QueryClient) => Pick<UseMutationOptions<Response<"createPet">, unknown, Parameters<Requests["createPet"]>[0], unknown>, "onSuccess" | "onSettled" | "onError">;
    useAddPetPhoto?: (queryClient: QueryClient) => Pick<UseMutationOptions<Response<"addPetPhoto">, unknown, Parameters<Requests["addPetPhoto"]>[0], unknown>, "onSuccess" | "onSettled" | "onError">;
};
function makeMutations(requests: Requests, config?: Config["mutations"]) {
    return {
        useCreatePet: (options?: Omit<UseMutationOptions<Response<"createPet">, unknown, Parameters<Requests["createPet"]>[0], unknown>, "mutationFn">) => useRapiniMutation<Response<"createPet">, unknown, Parameters<Requests["createPet"]>[0]>(payload => requests.createPet(payload), config?.useCreatePet, options),
        useAddPetPhoto: (petId: string, options?: Omit<UseMutationOptions<Response<"addPetPhoto">, unknown, Parameters<Requests["addPetPhoto"]>[0], unknown>, "mutationFn">) => useRapiniMutation<Response<"addPetPhoto">, unknown, Parameters<Requests["addPetPhoto"]>[0]>(payload => requests.addPetPhoto(payload, petId), config?.useAddPetPhoto, options)
    } as const;
}
`;

describe("makeMutations", () => {
  it("generates mutations for every non-GET path", () => {
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

    const str = compile(makeMutations(doc.paths));
    expect(str).toBe(expected);
  });
});
