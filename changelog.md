# Changelog

This document outlines the changes from version to version.

## 2.0.0

- Added support for SWR
- Revamped CLI options to accommodate SWR

## 2.1.0

- Added support for ESM output (Still includes CJS output)

## 2.3.0

- Fix return type for `anyOf` types

## 2.4.0

- Better handling of thrown errors, outputs clearer CLI errors

## 3.0.0

A major release with breaking changes. Involves updating type signatures to match React Query for the upcoming V5 release. This Rapini release doesn't directly support V5 yet, but it will make the transition to supporting it very easy once V5 is officially released publicly.

- Now using object syntax internally for `useQuery({})`, compatible with React Query V5
- Now using object syntax internally for `useMutation({})`, compatible with React Query V5
- `queryIds` renamed to `queryKeys` to match closer names used in React Query docs
- `nullIfUndefined` used for queryKey codegen now returns `NonNullable<T> | null` instead of `T | null` which removed `undefined` as a union type
- A new TS type is exported from the package as `QueryKeys` which is an object type of all the `queryKeys` generated
- `queryKeys` is exported from the package directly instead of as a return type from `initialize(..)`, this means it can be imported as `import { queryKeys } from 'your-package' `
- Fixed bug when dealing with vague input for request types and responses, now uses default response type if available, otherwise 2xx response type
