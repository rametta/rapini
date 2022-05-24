import type { OpenAPIV3 } from "openapi-types";
import ts from "typescript";

type SchemaOrReferenceObject =
  | OpenAPIV3.ReferenceObject
  | OpenAPIV3.SchemaObject;

function schemaObjectTypeToTS(
  objectType:
    | OpenAPIV3.ArraySchemaObjectType
    | OpenAPIV3.NonArraySchemaObjectType
) {
  switch (objectType) {
    case "string":
      return ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
    case "integer":
    case "number":
      return ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
    case "boolean":
      return ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword);
    case "object":
      return ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
    case "array":
      return ts.factory.createArrayTypeNode(
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
      );
    default:
      return ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
  }
}

function isSchemaObject(
  param: SchemaOrReferenceObject
): param is OpenAPIV3.SchemaObject {
  return "properties" in param;
}

function isArraySchemaObject(
  param: SchemaOrReferenceObject
): param is OpenAPIV3.ArraySchemaObject {
  return "items" in param;
}

function makeType(
  properties: { [name: string]: SchemaOrReferenceObject },
  required: string[]
) {
  if (properties) {
    return Object.keys(properties).map((key) => {
      if (isSchemaObject(properties[key])) {
        const item = properties[key];
        const isRequired = required.includes(key);
        return ts.factory.createPropertySignature(
          /*modifiers*/ undefined,
          /*name*/ ts.factory.createIdentifier(key),
          /*questionTOken*/ isRequired
            ? undefined
            : ts.factory.createToken(ts.SyntaxKind.QuestionToken),
          /*type*/ schemaObjectTypeToTS(item.type)
        );
      }
    });
  }
}

function generateProperties(item: SchemaOrReferenceObject) {
  if (isSchemaObject(item)) {
    return ts.factory.createTypeLiteralNode(
      makeType(item.properties, item.required ?? [])
    );
  } else if (isArraySchemaObject(item) && isSchemaObject(item.items)) {
    return ts.factory.createArrayTypeNode(
      ts.factory.createTypeLiteralNode(
        makeType(item.items.properties, item.items.required ?? [])
      )
    );
  }
}

export function makeTypes(doc: OpenAPIV3.Document) {
  return Object.entries(doc.components.schemas).map(([pattern, item]) => {
    return ts.factory.createTypeAliasDeclaration(
      /*decoratos*/ undefined,
      /*modifiers*/ [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      /*name*/ ts.factory.createIdentifier(pattern),
      /*typeParameters*/ undefined,
      /*type*/ generateProperties(item)
    );
  });
}
