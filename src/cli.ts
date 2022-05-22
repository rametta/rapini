#!/usr/bin/env node
import { generate } from "./generator";

const [, , ...args] = process.argv;

if (!args[0]) {
  throw "Missing path to openapi file";
}

console.log(`Generating package using OpenApi file ${args[0]}`);

generate(args[0]);
