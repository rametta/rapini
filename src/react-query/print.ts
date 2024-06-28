import fs from "fs";
import path from "path";
import { CLIOptions } from "../cli";

function printGeneratedTS(result: string, options: CLIOptions) {
  fs.writeFileSync(path.join(options.outputDir, "index.ts"), result);
}

const reactQueryVersionMap = {
  v3: `"react-query": "3.x.x"`,
  v4: `"@tanstack/react-query": "4.x.x"`,
  v5: `"@tanstack/react-query": "5.x.x"`,
} as const;

function printPackageJson(options: CLIOptions) {
  const pkgJson = `
  {
    "name": "${options.name}",
    "version": "${options.packageVersion}",
    "description": "This package was generated by Rapini",
    "module": "dist-esm/index.mjs",
    "main": "dist/index.js",
    "types": "dist/index.d.ts",
    "exports": {
      ".": {
        "import": "./dist-esm/index.mjs",
        "require": "./dist/index.js"
      },
      "./package.json": "./package.json"
    },
    "license": "private",
    "scripts": {
      "build": "npm run build-cjs && npm run build-esm",
      "build-cjs": "tsc index.ts --declaration --skipLibCheck --outDir dist",
      "build-esm": "tsc index.ts --skipLibCheck --moduleResolution node --target es2015 --esModuleInterop --outDir dist-esm && mv dist-esm/index.js dist-esm/index.mjs"
    },
    "peerDependencies": {
      "axios": "0.27.x",
      ${
        reactQueryVersionMap[options.reactQueryVersion] ??
        `"@tanstack/react-query": "latest"`
      }
    },
    "devDependencies": {
      "@types/node": "^17.0.34",
      "typescript": "^4.6.4"
    }
  }
  `;

  fs.writeFileSync(path.join(options.outputDir, "package.json"), pkgJson);
}

export function print(result: string, options: CLIOptions) {
  if (!fs.existsSync(options.outputDir)) {
    fs.mkdirSync(options.outputDir);
  }

  printGeneratedTS(result, options);
  if(!options.skipPackage) printPackageJson(options);
}
