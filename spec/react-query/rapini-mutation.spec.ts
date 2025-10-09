import { makeRapiniMutation } from "../../src/react-query/rapini-mutation";
import { compile } from "../test.utils";

const expected = `function useRapiniMutation<TData = unknown, TError = unknown, TVariables = void, TOnMutateResult = unknown>(mutationFn: MutationFunction<TData, TVariables>, config?: (queryClient: QueryClient) => Pick<UseMutationOptions<TData, TError, TVariables, TOnMutateResult>, "onSuccess" | "onSettled" | "onError">, options?: Omit<UseMutationOptions<TData, TError, TVariables, TOnMutateResult>, "mutationFn">): UseMutationResult<TData, TError, TVariables, TOnMutateResult> {
    const { onSuccess, onError, onSettled, ...rest } = options ?? {};
    const queryClient = useQueryClient();
    const conf = config?.(queryClient);
    const mutationOptions: typeof options = {
        onSuccess: (...args) => {
            conf?.onSuccess?.(...args);
            onSuccess?.(...args);
        },
        onError: (...args) => {
            conf?.onError?.(...args);
            onError?.(...args);
        },
        onSettled: (...args) => {
            conf?.onSettled?.(...args);
            onSettled?.(...args);
        },
        ...rest
    };
    return useMutation({ mutationFn, ...mutationOptions });
}
`;

describe("makeInitialize", () => {
  it("generates the correct rapinin mutation function", () => {
    const str = compile([makeRapiniMutation()]);
    expect(str).toBe(expected);
  });
});
