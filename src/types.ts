import { OpenAPIV3 } from "openapi-types";
import ts, { PropertySignature, TypeNode } from "typescript";
import { isReferenceObject, refToTypeName } from "./common";

function filterNonStringEnumValues(entry: unknown): entry is string {
  return typeof entry === "string";
}

function generateTsType(type: TypeNode, nullable?: boolean) {
  return nullable
    ? ts.factory.createUnionTypeNode([
        type,
        ts.factory.createLiteralTypeNode(ts.factory.createNull()),
      ])
    : type;
}

function schemaObjectTypeToTS(
  objectType?:
    | OpenAPIV3.ArraySchemaObjectType
    | OpenAPIV3.NonArraySchemaObjectType,
  nullable?: boolean,
  enumValues?: unknown[],
  arrayType?:
    | OpenAPIV3.ArraySchemaObjectType
    | OpenAPIV3.NonArraySchemaObjectType
): TypeNode {
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
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
        nullable
      );
    case "integer":
    case "number":
      return generateTsType(
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
        nullable
      );
    case "boolean":
      return generateTsType(
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword),
        nullable
      );
    case "object":
      return generateTsType(
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
        nullable
      );
    case "array":
      return generateTsType(
        ts.factory.createArrayTypeNode(
          arrayType
            ? schemaObjectTypeToTS(arrayType)
            : ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
        ),
        nullable
      );
    default:
      return ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);
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

function isAllOfObject(
  param: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject
): param is OpenAPIV3.SchemaObject {
  return "allOf" in param;
}

function isOneOfOrAnyOfObject(
  param: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject
): param is OpenAPIV3.SchemaObject {
  return "oneOf" in param || "anyOf" in param;
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
    let type;
    let arrayType;

    if (isPropertyTypeObject(item) && !isArraySchemaObject(item)) {
      type = schemaObjectTypeToTS(item.type, item.nullable, item.enum);
    } else if (isArraySchemaObject(item) && isPropertyTypeObject(item.items)) {
      arrayType = item.items.type;
      type = schemaObjectTypeToTS(
        item.type,
        item.nullable,
        item.enum,
        arrayType
      );
    } else if (isReferenceObject(item)) {
      type = ts.factory.createTypeReferenceNode(refToTypeName(item.$ref));
    } else {
      type = generateProperties(item);
    }

    return ts.factory.createPropertySignature(
      /*modifiers*/ undefined,
      /*name*/ ts.factory.createIdentifier(key),
      /*questionTOken*/ isRequired
        ? undefined
        : ts.factory.createToken(ts.SyntaxKind.QuestionToken),
      /*type*/ type
    );
  });
}

function generateProperties(
  item: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject
): TypeNode {
  if (isAllOfObject(item) && item.allOf) {
    return ts.factory.createIntersectionTypeNode(
      item.allOf.map((e) => {
        if (isReferenceObject(e)) {
          return ts.factory.createTypeReferenceNode(refToTypeName(e.$ref));
        }
        return generateProperties(e);
      })
    );
  }

  if (isOneOfOrAnyOfObject(item)) {
    const items = item.oneOf || item.anyOf;
    if (items) {
      return ts.factory.createUnionTypeNode(
        items.map((e) => {
          if (isReferenceObject(e)) {
            return ts.factory.createTypeReferenceNode(refToTypeName(e.$ref));
          }
          return generateProperties(e);
        })
      );
    }
  }

  if (isArraySchemaObject(item) && isReferenceObject(item.items)) {
    const typeName = refToTypeName(item.items.$ref);
    return ts.factory.createArrayTypeNode(
      ts.factory.createTypeReferenceNode(typeName)
    );
  }

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

  if (isSchemaObject(item)) {
    return ts.factory.createTypeLiteralNode(
      makeType(item.properties ?? {}, item.required ?? [])
    );
  }

  return ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);
}

export function makeTypes(doc: OpenAPIV3.Document) {
  const schemas = doc?.components?.schemas;
  if (schemas) {
    return Object.entries(schemas).map(([typeName, item]) => {
      return ts.factory.createTypeAliasDeclaration(
        /*decorators*/ undefined,
        /*modifiers*/ [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
        /*name*/ ts.factory.createIdentifier(typeName),
        /*typeParameters*/ undefined,
        /*type*/ generateProperties(item)
      );
    });
  }

  return [];
}
