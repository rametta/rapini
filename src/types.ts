import { OpenAPIV3 } from "openapi-types";
import ts, { PropertySignature, TypeElement, TypeNode } from "typescript";

function schemaObjectTypeToTS(
  objectType:
    | OpenAPIV3.ArraySchemaObjectType
    | OpenAPIV3.NonArraySchemaObjectType
    | undefined,
  enumValues: any[] | undefined
) {
  console.log(objectType);
  switch (objectType) {
    case "string":
      if (enumValues && enumValues.length > 0) {
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

function isPropertyTypeObject(
  param: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject
): param is OpenAPIV3.SchemaObject {
  return "type" in param;
}

function isArraySchemaObject(
  param: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject
): param is OpenAPIV3.ArraySchemaObject {
  return "items" in param;
}

function filterNonSchemaObjectEntry(
  entry: [string, OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject]
): entry is [string, OpenAPIV3.SchemaObject] {
  const [_, value] = entry;
  return isSchemaObject(value);
}

function makeType(
  properties: {
    [name: string]: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject;
  },
  required: string[]
): PropertySignature[] {
  return Object.keys(properties).map((key) => {
    const item = properties[key];
    console.log(item);
    const isRequired = required.includes(key);
    return ts.factory.createPropertySignature(
      /*modifiers*/ undefined,
      /*name*/ ts.factory.createIdentifier(key),
      /*questionTOken*/ isRequired
        ? undefined
        : ts.factory.createToken(ts.SyntaxKind.QuestionToken),
      /*type*/ isPropertyTypeObject(item)
        ? schemaObjectTypeToTS(item.type, item.enum)
        : ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
    );
  });
}

function generateProperties(item: OpenAPIV3.SchemaObject): TypeNode {
  if (
    isArraySchemaObject(item) &&
    isSchemaObject(item.items) &&
    item.items.properties
  ) {
    return ts.factory.createArrayTypeNode(
      ts.factory.createTypeLiteralNode(
        makeType(item.items.properties, item.items.required ?? [])
      )
    );
  }

  return ts.factory.createTypeLiteralNode(
    makeType(item.properties ?? {}, item.required ?? [])
  );
}

export function makeTypes(doc: OpenAPIV3.Document) {
  const schemas = doc?.components?.schemas;
  if (schemas) {
    const schemaObjs = Object.entries(schemas).filter(
      filterNonSchemaObjectEntry
    );

    return schemaObjs.map(([typeName, item]) => {
      return ts.factory.createTypeAliasDeclaration(
        /*decoratos*/ undefined,
        /*modifiers*/ [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
        /*name*/ ts.factory.createIdentifier(typeName),
        /*typeParameters*/ undefined,
        /*type*/ generateProperties(item)
      );
    });
  }
}
