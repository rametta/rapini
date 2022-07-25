import { makeImports } from "../src/imports";
import { compile } from "./test.utils";

const expected = `import type { AxiosInstance, AxiosRequestConfig } from "axios";
import { useQuery, useMutation, useQueryClient, type QueryClient, type UseMutationOptions, type UseQueryOptions, type MutationFunction, type UseMutationResult, type UseQueryResult } from "react-query";
`;

describe("makeImports", () => {
  it("generates the correct import statements", () => {
    const str = compile(makeImports());
    expect(str).toBe(expected);
  });
});
