import type { OpenAPIV3 } from "openapi-types";
import ts from "typescript";

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
  param: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject
): param is OpenAPIV3.SchemaObject {
  return "properties" in param;
}

function isArraySchemaObject(
  param:
    | OpenAPIV3.ArraySchemaObject
    | OpenAPIV3.ReferenceObject
    | OpenAPIV3.SchemaObject
): param is OpenAPIV3.ArraySchemaObject {
  return "items" in param;
}

function makeType(properties: object, required: string[]) {
  if (properties) {
    return Object.keys(properties).map((key) => {
      const isRequired = required.includes(key);
      return ts.factory.createPropertySignature(
        undefined,
        ts.factory.createIdentifier(key),
        isRequired
          ? undefined
          : ts.factory.createToken(ts.SyntaxKind.QuestionToken),
        schemaObjectTypeToTS(properties[key].type)
      );
    });
  }
}

function generateProperties(
  item:
    | OpenAPIV3.ArraySchemaObject
    | OpenAPIV3.ReferenceObject
    | OpenAPIV3.SchemaObject
) {
  if (isSchemaObject(item)) {
    return ts.factory.createTypeLiteralNode(
      makeType(item.properties, item.required || [])
    );
  } else if (isArraySchemaObject(item) && isSchemaObject(item.items)) {
    return ts.factory.createArrayTypeNode(
      ts.factory.createTypeLiteralNode(
        makeType(item.items.properties, item.items.required || [])
      )
    );
  }
}

export function generateTypes(doc: OpenAPIV3.Document) {
  return Object.entries(doc.components.schemas).map(([pattern, item]) => {
    return ts.factory.createTypeAliasDeclaration(
      undefined,
      [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      ts.factory.createIdentifier(pattern),
      undefined,
      generateProperties(item)
    );
  });
}
