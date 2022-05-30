[![npm](https://img.shields.io/npm/v/rapini.svg)](http://npm.im/rapini)
[![License](https://img.shields.io/github/license/rametta/rapini)](https://opensource.org/licenses/Apache-2.0)

# :leafy_green: Rapini - OpenAPI to React Query & Axios

Rapini is a tool that generates [React Query](https://react-query.tanstack.com/) hooks, [Axios](https://axios-http.com/) requests and [Typescript](https://www.typescriptlang.org/) types, based on an [OpenAPI](https://www.openapis.org/) spec file.
The generated code is packaged conveniently so that it can be published as a package on any NPM registry.

## Features

- :bicyclist: Generates axios calls for every endpoint, with typed payload.
- :golfing: Generates custom react hooks that use React Query's useQuery and useMutation hooks for each axios call.
- :rowboat: Generates query keys for every hook.
- :weight_lifting: Generates strong typescript types for all inputs, outputs, and options.

## Installation

Rapini is a CLI tool so you can install it globally for convenience

```sh
npm i -g rapini
```

## Usage

```sh
rapini -p path/to/openapi.yaml
```

This will generate the React Query code based on an OpenAPI file at `path/to/openapi.yaml`. The outputted code will be packaged in a way to just publish it as your own NPM package and then import it in your React project.

## CLI Options

```
Options:
  -V, --version                              output the version number
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
const rapini = initialize(axiosInstance);
rapini.queries; // { usePets, usePetById } ...
rapini.mutations; // { useUpdatePet, useDeletePet } ...
rapini.queryIds; // { pets: () => ['pets'] } ...
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
