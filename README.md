# :leafy_green: Rapini - OpenAPI to React Query & Axios

Rapini is a tool that generates [React Query](https://react-query.tanstack.com/), [Axios](https://axios-http.com/) and [Typescript](https://www.typescriptlang.org/) types, based on an [OpenAPI](https://www.openapis.org/) spec file.
The generated code is packaged conveniently so that it can be published as a package on any NPM registry.

## Features

- :surfing: Generates axios calls for every endpoint, with typed payload.
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
rapini path/to/openapi.yaml --outdir dist
```

This will generate the React Query code based on an OpenAPI file at `path/to/openapi.yaml` and output it in folder `dist`. The outputted code will be packaged in a way to just publish it as your own NPM package and then import it in your React project.

## Example Usage

Let's say you have an OpenAPI file that looks like [this one](./example-openapi.yaml).

Once you run the CLI tool to generate the React Query code, you can then run `npm publish` with your own package name, then import and use it like this:

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
const config = initialize(axiosInstance);
config.queries; // { usePets, usePetById } ...
config.mutations; // { useUpdatePet, useDeletePet } ...
config.queryIds; // { pets: () => ['pets'] } ...
config.requests; // { pets: () => axios.get<Pet[]>(...) } ...
```

## Important Notes

- Every request must have an `operationId` defined. The `operationId` is used in many places in the final generated code.
