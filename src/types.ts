import { OpenAPIV3 } from "openapi-types";
import ts, { EnumType, PropertySignature, TypeNode } from "typescript";

function filterNonStringEnumValues(entry: unknown): entry is string {
  return typeof entry === "string";
}

function generateTsType(nullable: boolean, type: TypeNode) {
  return nullable
    ? ts.factory.createUnionTypeNode([
        type,
        ts.factory.createLiteralTypeNode(ts.factory.createNull()),
      ])
    : type;
}

function schemaObjectTypeToTS(
  objectType:
    | OpenAPIV3.ArraySchemaObjectType
    | OpenAPIV3.NonArraySchemaObjectType
    | undefined,
  nullable: boolean = false,
  enumValues: unknown[] | undefined
) {
  switch (objectType) {
    case "string":
      if (enumValues && enumValues.length > 0) {
        const enums = enumValues
          .filter(filterNonStringEnumValues)
          .map((value) =>
            ts.factory.createLiteralTypeNode(
              ts.factory.createStringLiteral(value)
            )
          );

        if (nullable) {
          enums.push(ts.factory.createLiteralTypeNode(ts.factory.createNull()));
        }
        return ts.factory.createUnionTypeNode(enums);
      }
      return generateTsType(
        nullable,
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
      );
    case "integer":
    case "number":
      return generateTsType(
        nullable,
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)
      );
    case "boolean":
      return generateTsType(
        nullable,
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword)
      );
    case "object":
      return generateTsType(
        nullable,
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
      );
    case "array":
      return generateTsType(
        nullable,
        ts.factory.createArrayTypeNode(
          ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
        )
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
    const isRequired = required.includes(key);
    return ts.factory.createPropertySignature(
      /*modifiers*/ undefined,
      /*name*/ ts.factory.createIdentifier(key),
      /*questionTOken*/ isRequired
        ? undefined
        : ts.factory.createToken(ts.SyntaxKind.QuestionToken),
      /*type*/ isPropertyTypeObject(item)
        ? schemaObjectTypeToTS(item.type, item.nullable, item.enum)
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
