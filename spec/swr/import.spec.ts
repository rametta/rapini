import { makeImports } from "../../src/swr/imports";
import { compile } from "../test.utils";

const expected = `import type { AxiosInstance, AxiosRequestConfig } from "axios";
import useSWR, { type SWRConfiguration, type SWRResponse } from "swr";
`;

describe("makeImports", () => {
  it("generates the correct import statements", () => {
    const str = compile(makeImports());
    expect(str).toBe(expected);
  });
});
