import { CLIOptions } from "../../src/cli";
import { makeImports } from "../../src/react-query/imports";
import { compile } from "../test.utils";

const expectedV3 = `import type { AxiosInstance, AxiosRequestConfig } from "axios";
import { useQuery, useMutation, useQueryClient, type QueryClient, type UseMutationOptions, type UseQueryOptions, type MutationFunction, type UseMutationResult, type UseQueryResult } from "react-query";
`;

const expectedV4Plus = `import type { AxiosInstance, AxiosRequestConfig } from "axios";
import { useQuery, useMutation, useQueryClient, type QueryClient, type UseMutationOptions, type UseQueryOptions, type MutationFunction, type UseMutationResult, type UseQueryResult } from "@tanstack/react-query";
`;

describe("makeImports", () => {
  it("generates the correct import statements for v3", () => {
    const str = compile(makeImports({ reactQueryVersion: "v3" } as CLIOptions));
    expect(str).toBe(expectedV3);
  });

  it("generates the correct import statements for v4", () => {
    const str = compile(makeImports({ reactQueryVersion: "v4" } as CLIOptions));
    expect(str).toBe(expectedV4Plus);
  });

  it("generates the correct import statements for v5", () => {
    const str = compile(makeImports({ reactQueryVersion: "v5" } as CLIOptions));
    expect(str).toBe(expectedV4Plus);
  });
});
