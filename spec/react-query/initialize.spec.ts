import { makeInitialize } from "../../src/react-query/initialize";
import { compile } from "../test.utils";

const expected = `export function initialize(axios: AxiosInstance, config?: Config) {
    const requests = makeRequests(axios, config?.axios);
    const queryIds = makeQueryIds();
    return {
        requests,
        queryIds,
        queries: makeQueries(requests, queryIds),
        mutations: makeMutations(requests, config?.mutations)
    };
}
`;

describe("makeInitialize", () => {
  it("generates the correct initialize function", () => {
    const str = compile([makeInitialize()]);
    expect(str).toBe(expected);
  });
});
