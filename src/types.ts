import type { OpenAPIV3 } from "openapi-types";
import ts from "typescript";

function schemaObjectTypeToTS(
  objectType:
    | OpenAPIV3.ArraySchemaObjectType
    | OpenAPIV3.NonArraySchemaObjectType,
  enumValues: string[]
) {
  switch (objectType) {
    case "string":
      if (enumValues.length > 0) {
        return ts.factory.createUnionTypeNode(
          enumValues.map((value) =>
            ts.factory.createLiteralTypeNode(
              ts.factory.createStringLiteral(value)
            )
          )
        );
      }
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
  param: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject
): param is OpenAPIV3.ArraySchemaObject {
  return "items" in param;
}

function makeType(
  properties: {
    [name: string]: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject;
  },
  required: string[]
) {
  if (properties) {
    return Object.keys(properties).map((key) => {
      const item = properties[key];
      if (isSchemaObject(item)) {
        const isRequired = required.includes(key);
        return ts.factory.createPropertySignature(
          /*modifiers*/ undefined,
          /*name*/ ts.factory.createIdentifier(key),
          /*questionTOken*/ isRequired
            ? undefined
            : ts.factory.createToken(ts.SyntaxKind.QuestionToken),
          /*type*/ schemaObjectTypeToTS(item.type, item.enum)
        );
      }
    });
  }
}

function generateProperties(
  item: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject
) {
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
  return Object.entries(doc.components.schemas).map(([typeName, item]) => {
    return ts.factory.createTypeAliasDeclaration(
      /*decoratos*/ undefined,
      /*modifiers*/ [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      /*name*/ ts.factory.createIdentifier(typeName),
      /*typeParameters*/ undefined,
      /*type*/ generateProperties(item)
    );
  });
}
