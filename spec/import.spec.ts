import { makeImports } from "../src/imports";
import { compile } from "./test.utils";

const expected = `import type { AxiosInstance } from "axios";
import { useQuery, useMutation, type UseMutationOptions, type UseQueryOptions } from "react-query";
`;

describe("makeImports", () => {
  it("generates the correct import statements", () => {
    const str = compile(makeImports());
    expect(str).toBe(expected);
  });
});
