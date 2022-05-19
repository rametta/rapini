#!/usr/bin/env node
import { generate } from "./generator";

const [, , ...args] = process.argv;

console.log(`Generating package using OpenApi file ${args[0]}`);

generate(args[0]);
