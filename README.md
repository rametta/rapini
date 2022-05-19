# :leafy_green: Rapini - OpenAPI to React Query & Axios

Rapini is a tool that generates [React Query](https://react-query.tanstack.com/) and [Axios](https://axios-http.com/) code with also [Typescript](https://www.typescriptlang.org/) types, based on an [OpenAPI](https://www.openapis.org/) spec file.
The generated code is packaged conveiently so that it can be published as a package on any NPM registry.

## Installation

Rapini is a CLI tool so you can install it globally for convenience

```sh
npm i -g rapini
```

## Usage

```sh
rapini path/to/openapi.yaml --outdir dist
```

This will generate the React Query code based on an OpenAPI file at `path/to/openapi.yaml` and output it in folder `dist`. The outputted code will be packaged in a convenient way to just deploy it as your own NPM package. You can then publish the package and import it in your React project.

## Example Usage

Let's say you have an OpenAPI file that looks like [this one](./example-openapi.yaml).

Once you run the CLI tool to generate the React Query code, you can them run `npm publish` with your own package name, then import and use it like this:

```tsx
import { initialize } from "your-custom-package";
import { axiosInstance } from "./your-custom-axios-instance";

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
