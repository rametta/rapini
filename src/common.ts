import ts from "typescript";
import type { OpenAPIV3 } from "openapi-types";
import { createLiteralNodeFromProperties } from "./types";

export function toParamObjects(
  params: (OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject)[]
): OpenAPIV3.ParameterObject[] {
  return params?.filter(<typeof isParameterObject>isParameterObject) ?? [];
}

export function isParameterObject(
  param: OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject
): param is OpenAPIV3.ParameterObject {
  return "name" in param;
}

export function isReferenceObject(
  item?: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject
): item is OpenAPIV3.ReferenceObject {
  return item !== undefined && "$ref" in item;
}

export function isArraySchemaObject(
  param: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject
): param is OpenAPIV3.ArraySchemaObject {
  return "items" in param;
}

export function isAllOfObject(
  param: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject
): param is OpenAPIV3.SchemaObject {
  return "allOf" in param;
}

export function isOneOfOrAnyOfObject(
  param: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject
): param is OpenAPIV3.SchemaObject {
  return "oneOf" in param || "anyOf" in param;
}

const unknown = ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);

export function schemaObjectOrRefType(
  schema?: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject
): { node: ts.TypeNode; id: string } {
  if (!schema) {
    return { node: unknown, id: "unknown" };
  }

  if (isReferenceObject(schema)) {
    return referenceType(schema);
  }

  return schemaObjectType(schema);
}

function schemaObjectType(
  schema: OpenAPIV3.SchemaObject
): ReturnType<typeof schemaObjectOrRefType> {
  if (schema.type === "array") {
    return arrayType(schema.items);
  }

  if (schema.type === "object") {
    return objectType(schema);
  }

  return { node: nonArraySchemaObjectTypeToTs(schema), id: "unknown" };
}

export function createTypeAliasDeclarationTypeWithSchemaObject(
  item: OpenAPIV3.SchemaObject
): ts.TypeNode {
  if (isAllOfObject(item) && item.allOf) {
    return ts.factory.createIntersectionTypeNode(
      item.allOf.map((allOfItem) =>
        isReferenceObject(allOfItem)
          ? createTypeRefFromRef(allOfItem)
          : createTypeAliasDeclarationTypeWithSchemaObject(allOfItem)
      )
    );
  }

  if (isOneOfOrAnyOfObject(item)) {
    const items = item.oneOf || item.anyOf;
    if (items) {
      return ts.factory.createUnionTypeNode(
        items.map((oneOrAnyItem) =>
          isReferenceObject(oneOrAnyItem)
            ? createTypeRefFromRef(oneOrAnyItem)
            : createTypeAliasDeclarationTypeWithSchemaObject(oneOrAnyItem)
        )
      );
    }
  }

  if (isArraySchemaObject(item)) {
    return ts.factory.createArrayTypeNode(
      isReferenceObject(item.items)
        ? createTypeRefFromRef(item.items)
        : createTypeAliasDeclarationTypeWithSchemaObject(item.items)
    );
  }

  if (item.additionalProperties) {
    return createDictionaryType(item);
  }

  if (item.properties) {
    return createLiteralNodeFromProperties(item);
  }

  return nonArraySchemaObjectTypeToTs(item);
}

export function createTypeRefFromRef(item: OpenAPIV3.ReferenceObject) {
  return ts.factory.createTypeReferenceNode(refToTypeName(item.$ref));
}

function createTypeAliasDeclarationType(
  item: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject
): ts.TypeNode {
  return isReferenceObject(item)
    ? createTypeRefFromRef(item)
    : createTypeAliasDeclarationTypeWithSchemaObject(item);
}

function resolveAdditionalPropertiesType(
  additionalProperties: OpenAPIV3.SchemaObject["additionalProperties"]
) {
  if (!additionalProperties) {
    return ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);
  }

  if (typeof additionalProperties === "boolean") {
    if (additionalProperties === true) {
      return ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
    }

    return ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);
  }

  return createTypeAliasDeclarationType(additionalProperties);
}

// Dictionaries look like: { [key: string]: any }
export function createDictionaryType(item: OpenAPIV3.SchemaObject) {
  return ts.factory.createTypeLiteralNode([
    ts.factory.createIndexSignature(
      /*decorators*/ undefined,
      /*modifiers*/ undefined,
      /*params*/ [
        ts.factory.createParameterDeclaration(
          /*decorators*/ undefined,
          /*modifiers*/ undefined,
          /*dotDotDotToken*/ undefined,
          /*name*/ ts.factory.createIdentifier("key"),
          /*questionToken*/ undefined,
          /*type*/ ts.factory.createKeywordTypeNode(
            ts.SyntaxKind.StringKeyword
          ),
          /*initializer*/ undefined
        ),
      ],
      /*type*/ resolveAdditionalPropertiesType(item.additionalProperties)
    ),
  ]);
}

export function nonArraySchemaObjectTypeToTs(
  item: OpenAPIV3.NonArraySchemaObject
): ts.TypeNode {
  if (!item.type) {
    return ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
  }

  switch (item.type) {
    case "string": {
      if (item.enum) {
        return schemaObjectTypeToEnumType(item.enum, item.nullable);
      }
      return appendNullToUnion(
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
        item.nullable
      );
    }
    case "integer":
    case "number":
      return appendNullToUnion(
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
        item.nullable
      );
    case "boolean":
      return appendNullToUnion(
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword),
        item.nullable
      );
    case "object": {
      if (item.additionalProperties) {
        return createDictionaryType(item);
      }

      return appendNullToUnion(
        createLiteralNodeFromProperties(item),
        item.nullable
      );
    }
    default:
      return ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);
  }
}

function schemaObjectTypeToEnumType(enumValues: string[], nullable?: boolean) {
  const enums = enumValues.map((value) =>
    ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(value))
  );

  return appendNullToUnion(
    ts.factory.createUnionTypeNode(/*types*/ enums),
    nullable
  );
}

export function appendNullToUnion(type: ts.TypeNode, nullable?: boolean) {
  return nullable
    ? ts.factory.createUnionTypeNode(
        /*types*/ [
          type,
          ts.factory.createLiteralTypeNode(ts.factory.createNull()),
        ]
      )
    : type;
}

function objectType(
  item: OpenAPIV3.NonArraySchemaObject
): ReturnType<typeof schemaObjectOrRefType> {
  return {
    node: createLiteralNodeFromProperties(item),
    id: "object", // stringify type maybe here
  };
}

function referenceType(
  item: OpenAPIV3.ReferenceObject
): ReturnType<typeof schemaObjectOrRefType> {
  const name = refToTypeName(item.$ref);
  return {
    node: ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(name)),
    id: name,
  };
}

function arrayType(
  items: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject
): ReturnType<typeof schemaObjectOrRefType> {
  const type = isReferenceObject(items)
    ? referenceType(items)
    : schemaObjectType(items);

  return {
    node: ts.factory.createArrayTypeNode(type.node),
    id: type.id + "[]",
  };
}

export function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function lowercaseFirstLetter(str: string) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

/**
 * Normalizes operation id's so there is consistency
 * @param operationId Raw value from openapi file
 * @returns normalized value with underscores and dashes removed, and in camelCase
 * @example normalizeOperationId("helloGoodbye") // helloGoodbye
 * @example normalizeOperationId("test1-test8-test1_test2") // test1Test8Test1Test2
 * @example normalizeOperationId("Test1_test8-test1_test2") // test1Test8Test1Test2
 */
export function normalizeOperationId(operationId: string) {
  const split = operationId
    .split("-")
    .flatMap((x) => x.split("_"))
    .map((x, i) =>
      i === 0 ? lowercaseFirstLetter(x) : capitalizeFirstLetter(x)
    );
  return split.join("");
}

export function isRequestBodyObject(
  obj: OpenAPIV3.ReferenceObject | OpenAPIV3.RequestBodyObject
): obj is OpenAPIV3.RequestBodyObject {
  return "content" in obj;
}

// Replaces dots/hyphens/underscores with nothing
// and capitalizes every items first letter
export function sanitizeTypeName(name: string) {
  return name
    .split(".")
    .flatMap((x) => x.split("-"))
    .flatMap((x) => x.split("_"))
    .map(capitalizeFirstLetter)
    .join("");
}

/**
 * Removes the path in the ref and just returns the last part, which is used as the Type name
 * @param ref The ref in the OpenAPI file
 * @returns The type name
 */
export function refToTypeName(ref: string) {
  if (ref.startsWith("#/components/schemas/")) {
    const name = ref.slice(21);
    return sanitizeTypeName(name);
  }

  return ref;
}

export function createParams(item: OpenAPIV3.OperationObject) {
  if (!item.parameters) {
    return [];
  }

  const paramObjects = toParamObjects(item.parameters);

  return paramObjects
    .sort((x, y) => (x.required === y.required ? 0 : x.required ? -1 : 1)) // put all optional values at the end
    .map((param) => ({
      required: param.required ?? false,
      name: ts.factory.createIdentifier(param.name),
      arrowFuncParam: ts.factory.createParameterDeclaration(
        /*decorators*/ undefined,
        /*modifiers*/ undefined,
        /*dotDotDotToken*/ undefined,
        /*name*/ ts.factory.createIdentifier(param.name),
        /*questionToken*/ param.required
          ? undefined
          : ts.factory.createToken(ts.SyntaxKind.QuestionToken),
        /*type*/ schemaObjectOrRefType(param.schema).node,
        /*initializer*/ undefined
      ),
    }));
}
