import { OpenAPIV3 } from "openapi-types";
import ts, { PropertySignature, TypeNode } from "typescript";
import { isReferenceObject, refToTypeName } from "./common";

function isSchemaObject(
  param: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject
): param is OpenAPIV3.BaseSchemaObject {
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

function filterNonStringEnumValues(entry: unknown): entry is string {
  return typeof entry === "string";
}

function generateTsTypeWithNullable(type: TypeNode, nullable?: boolean) {
  return nullable
    ? ts.factory.createUnionTypeNode([
        type,
        ts.factory.createLiteralTypeNode(ts.factory.createNull()),
      ])
    : type;
}

function schemaObjectTypeToArrayType(
  item: OpenAPIV3.SchemaObject,
  nullable?: boolean,
  arrayType?:
    | OpenAPIV3.NonArraySchemaObjectType
    | OpenAPIV3.ArraySchemaObjectType
): TypeNode {
  if (
    arrayType === "array" &&
    isArraySchemaObject(item) &&
    isPropertyTypeObject(item.items)
  ) {
    return ts.factory.createArrayTypeNode(
      schemaObjectTypeToArrayType(
        item.items,
        item.items.nullable,
        item.items.type
      )
    );
  } else {
    return generateTsTypeWithNullable(
      ts.factory.createArrayTypeNode(schemaObjectTypeToTS(arrayType)),
      nullable
    );
  }
}

function schemaObjectTypeToEnumType(enumValues: string[], nullable?: boolean) {
  const enums = enumValues
    .filter(filterNonStringEnumValues)
    .map((value) =>
      ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(value))
    );

  return generateTsTypeWithNullable(
    ts.factory.createUnionTypeNode(enums),
    nullable
  );
}

function schemaObjectTypeToTS(
  objectType?:
    | OpenAPIV3.NonArraySchemaObjectType
    | OpenAPIV3.ArraySchemaObjectType,
  nullable?: boolean
): TypeNode {
  switch (objectType) {
    case "string":
      return generateTsTypeWithNullable(
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
        nullable
      );
    case "integer":
    case "number":
      return generateTsTypeWithNullable(
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
        nullable
      );
    case "boolean":
      return generateTsTypeWithNullable(
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword),
        nullable
      );
    case "object":
      return generateTsTypeWithNullable(
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
        nullable
      );
    default:
      return ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);
  }
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

    if (isPropertyTypeObject(item) && !isArraySchemaObject(item)) {
      type = item.enum
        ? schemaObjectTypeToEnumType(item.enum, item.nullable)
        : schemaObjectTypeToTS(item.type, item.nullable);
    } else if (isArraySchemaObject(item) && isPropertyTypeObject(item.items)) {
      const arrayType = item.items.type;
      type = schemaObjectTypeToArrayType(item.items, item.nullable, arrayType);
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
      item.allOf.map((allOfItem) =>
        isReferenceObject(allOfItem)
          ? ts.factory.createTypeReferenceNode(refToTypeName(allOfItem.$ref))
          : generateProperties(allOfItem)
      )
    );
  }

  if (isOneOfOrAnyOfObject(item)) {
    const items = item.oneOf || item.anyOf;
    if (items) {
      return ts.factory.createUnionTypeNode(
        items.map((oneOrAnyItem) =>
          isReferenceObject(oneOrAnyItem)
            ? ts.factory.createTypeReferenceNode(
                refToTypeName(oneOrAnyItem.$ref)
              )
            : generateProperties(oneOrAnyItem)
        )
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
  const schemas = doc.components?.schemas;
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
