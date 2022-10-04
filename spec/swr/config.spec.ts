import { makeConfigTypes } from "../../src/swr/config";
import { compile } from "../test.utils";

const expected = `export type AxiosConfig = {
    paramsSerializer?: AxiosRequestConfig["paramsSerializer"];
};
export type Config = {
    axios?: AxiosConfig;
};
`;

describe("makeConfigTypes", () => {
  it("generates the correct config types", () => {
    const str = compile(makeConfigTypes());
    expect(str).toBe(expected);
  });
});
