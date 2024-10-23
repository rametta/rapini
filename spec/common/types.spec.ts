import type { OpenAPIV3 } from "openapi-types";
import { makeTypes } from "../../src/common/types";
import { compile } from "../test.utils";

const expected = `export type RandomThing = {
    id: number;
    something: {
        hello?: {
            one?: string;
            two?: number;
        };
        world?: string;
        bla?: {
            prop?: string;
            erty?: string;
        }[];
    };
};
export type Pet = {
    id: number;
    name: string;
    tag?: string | null;
    petType?: ("cat" | "doge") | null;
    nicknames?: string[];
    random?: RandomThing;
};
export type Pets = Pet[];
export type Animal = {
    home?: string;
    pet?: Pet;
};
export type Cat = Pet & {
    name?: string;
};
export type Dog = Pet & {
    bark?: string;
    'is-cute'?: boolean;
};
export type MyResponseType = Cat | Dog;
export type MyResponseTypeTwo = Cat | Dog;
export type Error = {
    code: number;
    message: string;
};
export type MyDictionary = {
    [key: string]: string;
};
export type MyDictionaryAny = {
    [key: string]: any;
};
export type MyDictionaryAny2 = {
    [key: string]: any;
};
export type MyDictionaryStringArray = {
    [key: string]: string[];
};
export type MyDictionaryRef = {
    [key: string]: Cat;
};
export type MyDictionaryValue = {
    [key: string]: {
        code?: number;
        text?: string;
    };
};
export type MyDictionaryValueNested = {
    field?: {
        [key: string]: {
            nested?: boolean;
        };
    };
};
`;

describe("makeTypes", () => {
  it("generates the correct types", () => {
    const doc: OpenAPIV3.Document = {
      openapi: "3.0.0",
      info: {
        title: "Test",
        version: "1.0.0",
      },
      paths: {},
      components: {
        schemas: {
          RandomThing: {
            type: "object",
            required: ["id", "something"],
            properties: {
              id: {
                type: "integer",
              },
              something: {
                properties: {
                  hello: {
                    properties: {
                      one: {
                        type: "string",
                      },
                      two: {
                        type: "integer",
                      },
                    },
                  },
                  world: {
                    type: "string",
                  },
                  bla: {
                    type: "array",
                    items: {
                      properties: {
                        prop: {
                          type: "string",
                        },
                        erty: {
                          type: "string",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          Pet: {
            type: "object",
            required: ["id", "name"],
            properties: {
              id: {
                type: "integer",
              },
              name: {
                type: "string",
              },
              tag: {
                type: "string",
                nullable: true,
              },
              petType: {
                type: "string",
                enum: ["cat", "doge"],
                nullable: true,
              },
              nicknames: {
                type: "array",
                items: {
                  type: "string",
                },
              },
              random: {
                $ref: "#/components/schemas/RandomThing",
              },
            },
          },
          Pets: {
            type: "array",
            items: {
              $ref: "#/components/schemas/Pet",
            },
          },
          Animal: {
            type: "object",
            properties: {
              home: {
                type: "string",
              },
              pet: {
                $ref: "#/components/schemas/Pet",
              },
            },
          },
          Cat: {
            type: "object",
            allOf: [
              {
                $ref: "#/components/schemas/Pet",
              },
              {
                properties: {
                  name: {
                    type: "string",
                  },
                },
              },
            ],
          },
          Dog: {
            type: "object",
            allOf: [
              {
                $ref: "#/components/schemas/Pet",
              },
              {
                properties: {
                  bark: {
                    type: "string",
                  },
                  "is-cute": {
                    type: "boolean",
                  },
                },
              },
            ],
          },
          MyResponseType: {
            oneOf: [
              {
                $ref: "#/components/schemas/Cat",
              },
              {
                $ref: "#/components/schemas/Dog",
              },
            ],
          },
          MyResponseTypeTwo: {
            oneOf: [
              {
                $ref: "#/components/schemas/Cat",
              },
              {
                $ref: "#/components/schemas/Dog",
              },
            ],
          },
          Error: {
            type: "object",
            required: ["code", "message"],
            properties: {
              code: {
                type: "integer",
              },
              message: {
                type: "string",
              },
            },
          },
          MyDictionary: {
            type: "object",
            additionalProperties: {
              type: "string",
            },
          },
          MyDictionaryAny: {
            type: "object",
            additionalProperties: true,
          },
          MyDictionaryAny2: {
            type: "object",
            additionalProperties: {},
          },
          MyDictionaryStringArray: {
            type: "object",
            additionalProperties: {
              type: "array",
              items: {
                type: "string",
              },
            },
          },
          MyDictionaryRef: {
            type: "object",
            additionalProperties: {
              $ref: "#/components/schemas/Cat",
            },
          },
          MyDictionaryValue: {
            type: "object",
            additionalProperties: {
              type: "object",
              properties: {
                code: {
                  type: "integer",
                },
                text: {
                  type: "string",
                },
              },
            },
          },
          MyDictionaryValueNested: {
            type: "object",
            properties: {
              field: {
                type: "object",
                additionalProperties: {
                  type: "object",
                  properties: {
                    nested: {
                      type: "boolean",
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    const str = compile(makeTypes({} as any, doc));
    expect(str).toBe(expected);
  });
});
