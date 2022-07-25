import type { OpenAPIV3 } from "openapi-types";
import { makeMutations } from "../src/mutations";
import { compile } from "./test.utils";

const expected = `type MutationConfigs = {
    useCreatePet?: (queryClient: QueryClient) => Pick<UseMutationOptions<Awaited<ReturnType<ReturnType<typeof makeRequests>["createPet"]>>, unknown, Parameters<ReturnType<typeof makeRequests>["createPet"]>[0], unknown>, "onSuccess" | "onSettled" | "onError">;
};
function makeMutations(requests: ReturnType<typeof makeRequests>, config?: Config["mutations"]) {
    return {
        useCreatePet: (options?: Omit<UseMutationOptions<Awaited<ReturnType<typeof requests.createPet>>, unknown, Parameters<typeof requests.createPet>[0], unknown>, "mutationFn">) => useRapiniMutation<Awaited<ReturnType<typeof requests.createPet>>, unknown, Parameters<typeof requests.createPet>[0]>(payload => requests.createPet(payload), config?.useCreatePet, options)
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
      },
    };

    const str = compile(makeMutations(doc.paths));
    expect(str).toBe(expected);
  });
});
