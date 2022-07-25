import type { OpenAPIV3 } from "openapi-types";
import { makeQueries } from "../src/queries";
import { compile } from "./test.utils";

const expected = `function makeQueries(requests: ReturnType<typeof makeRequests>, queryIds: ReturnType<typeof makeQueryIds>) {
    return {
        useGetPets: (options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof requests.getPets>>, unknown, Awaited<ReturnType<typeof requests.getPets>>, ReturnType<(typeof queryIds)["getPets"]>>, "queryKey" | "queryFn">): UseQueryResult<Awaited<ReturnType<typeof requests.getPets>>, unknown> => useQuery(queryIds.getPets(), () => requests.getPets(), options),
        useGetPet: (petId: string, options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof requests.getPet>>, unknown, Awaited<ReturnType<typeof requests.getPet>>, ReturnType<(typeof queryIds)["getPet"]>>, "queryKey" | "queryFn">): UseQueryResult<Awaited<ReturnType<typeof requests.getPet>>, unknown> => useQuery(queryIds.getPet(petId), () => requests.getPet(petId), options)
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
      },
    };

    const str = compile([makeQueries(doc.paths)]);
    expect(str).toBe(expected);
  });
});
