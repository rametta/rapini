[![npm](https://img.shields.io/npm/v/rapini.svg)](http://npm.im/rapini)
[![License](https://img.shields.io/github/license/rametta/rapini)](https://opensource.org/licenses/Apache-2.0)
[![PR Test](https://github.com/rametta/rapini/actions/workflows/test.yml/badge.svg)](https://github.com/rametta/rapini/actions/workflows/test.yml)

# :leafy_green: Rapini - OpenAPI to React Query (or SWR) & Axios

Rapini is a tool that generates [React Query](https://tanstack.com/query/latest/) (or [SWR](https://swr.vercel.app/)) hooks, [Axios](https://axios-http.com/) requests and [Typescript](https://www.typescriptlang.org/) types, based on an [OpenAPI](https://www.openapis.org/) spec file.
The generated code is packaged conveniently so that it can be published as a package on any NPM registry.

## Features

- :bicyclist: Generates axios calls for every endpoint, with typed payload.
- :golfing: Generates custom react hooks that use React Query's `useQuery` and `useMutation` hooks for each axios call. Optional to generate custom hooks that use SWR's `useSWR` hook.
- :rowboat: Generates query keys for every hook.
- :weight_lifting: Generates strong typescript types for all inputs, outputs, and options.

## Getting Started

Rapini is a CLI tool so you can execute the remote npm package directly for convenience

```sh
npx rapini [library] [options]
```

eg:

```sh
# For React Query V3
npx rapini react-query -p path/to/openapi.yaml

# For TanStack Query 4
npx rapini react-query v4 -p path/to/openapi.yaml

# For TanStack Query 5
npx rapini react-query v5 -p path/to/openapi.yaml

# For SWR
npx rapini swr -p path/to/openapi.yaml
```

This will generate the package code based on an OpenAPI file at `path/to/openapi.yaml`. The outputted code will be packaged in a way to just publish it as your own NPM package and then import it in your React project.

## CLI Arguments & Options

### `rapini help` outputs the following:

```
Usage: rapini [options] [command]

Generate a package based on OpenAPI

Options:
  -V, --version                    output the version number
  -h, --help                       display help for command

Commands:
  react-query [options] [version]  Generate a Package for TanStack Query V4 or React Query V3
  swr [options]                    Generate a Package for SWR (stale-while-revalidate)
  help [command]                   display help for command
```

### `rapini help react-query` outputs the following:

```
Usage: rapini react-query [options] [react-query-version]

Generate a Package for TanStack Query V4 or V5, or legacy React Query V3

Options:
  -p, --path <path>                          Path to OpenAPI file
  -n, --name [name]                          Name to use for the generated package (default: "rapini-generated-package")
  -pv, --package-version [version]           Semver version to use for the generated package (default: "1.0.0")
  -o, --output-dir [directory]               Directory to output the generated package (default: "rapini-generated-package")
  -b, --base-url [url]                       Prefix every request with this url
  -r, --replacer [oldString] [newString...]  Replace part(s) of any route's path with simple string replacements. Ex: `-r /api/v1 /api/v2` would replace the v1 with v2 in every route
  -h, --help                                 display help for command
```

### `rapini help swr` outputs the following:

```
Usage: rapini swr [options]

Generate a Package for SWR (stale-while-revalidate)

Options:
  -p, --path <path>                          Path to OpenAPI file
  -n, --name [name]                          Name to use for the generated package (default: "rapini-generated-package")
  -pv, --package-version [version]           Semver version to use for the generated package (default: "1.0.0")
  -o, --output-dir [directory]               Directory to output the generated package (default: "rapini-generated-package")
  -b, --base-url [url]                       Prefix every request with this url
  -r, --replacer [oldString] [newString...]  Replace part(s) of any route's path with simple string replacements. Ex: `-r /api/v1 /api/v2` would replace the v1 with v2 in every route
  -h, --help                                 display help for command
```

## Example Usage

Let's say you have an OpenAPI file that looks like [this one](./example-openapi.yaml).

Once you run the CLI tool to generate the React Query code, you can then `cd` into the generated directory, run `npm install && npm run build` then `npm publish` with your own package name to publish it to your own registry, then import and use it like this:

```tsx
import { initialize } from "your-custom-package";
import { axiosInstance } from "./your-custom-axios-instance";

// Can even import the generated Typescript Types if needed
import type { Pet } from "your-custom-package";

const config = initialize(axiosInstance);

const { usePets } = config.queries;

const MyComponent = () => {
  const { data, isLoading, isError } = usePets();

  return (
    <ul>
      {data.pets.map((pet) => (
        <li key={pet.id}>{pet.name}</li>
      ))}
    </ul>
  );
};
```

You must call `initialize(axiosInstance)` with your custom axios instance. The return value from the `initialize` will give you an object with everything you need, here is the return value with examples:

```ts
import { queryKeys } from "generated-package";
// queryKeys = { pets: () => ['pets'] } ...

const rapini = initialize(axiosInstance);
rapini.queries; // { usePets, usePetById } ...
rapini.mutations; // { useUpdatePet, useDeletePet } ... if generated by SWR, there will be no property `mutations`
rapini.requests; // { pets: () => axios.get<Pet[]>(...) } ...
```

### With Global Config

There may be times when you want extra functionality hooked into each hook's callbacks. You can do this normally by passing `options` to each hook, but if you want something more global - a config can be provided to the `initialize` function.

```ts
import { initialize, type Config } from "your-custom-package";
import type { QueryClient } from "react-query";

const config: Config = {
  mutations: {
    useCreatePet: (queryClient: QueryClient) => ({
      onSuccess: () => showSuccessNotification(),
      onError: () => showErrorNotification(),
    }),
  },
};

const rapini = initialize(axiosInstance, config);
```

## Important Notes

- Every request must have an `operationId` defined. The `operationId` is used in many places in the final generated code.
