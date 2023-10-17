import ts from "typescript";
import type { OpenAPI, OpenAPIV3 } from "openapi-types";
import { createLiteralNodeFromProperties } from "./types";
import type SwaggerParser from "swagger-parser";

export function isOpenApiV3Document(
  doc: OpenAPI.Document
): doc is OpenAPIV3.Document {
  return "openapi" in doc;
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

const unknownTypeNode = ts.factory.createKeywordTypeNode(
  ts.SyntaxKind.UnknownKeyword
);

export function nodeId(node: ts.TypeNode): string {
  if (ts.isArrayTypeNode(node)) {
    return `Array<${nodeId(node.elementType)}>`;
  }

  if (ts.isParenthesizedTypeNode(node)) {
    return `(${nodeId(node.type)})`;
  }

  if (ts.isUnionTypeNode(node)) {
    return node.types.map(nodeId).join("|");
  }

  if (ts.isTypeLiteralNode(node)) {
    return (
      "type-literal-" +
      node.members
        .map((elementType) =>
          elementType.name && ts.isIdentifier(elementType.name)
            ? elementType.name.text
            : elementType.kind
        )
        .join("&")
    );
  }

  if (ts.isIdentifier(node)) {
    return node.text;
  }

  if (ts.isTypeReferenceNode(node)) {
    if (ts.isIdentifier(node.typeName)) {
      return node.typeName.text;
    }
  }

  return node.kind.toString();
}

export function schemaObjectOrRefType(
  $refs: SwaggerParser.$Refs,
  schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject | undefined
): { node: ts.TypeNode; id: string } {
  if (!schema || (isReferenceObject(schema) && !schema.$ref)) {
    return { node: unknownTypeNode, id: "unknown" };
  }

  if (isReferenceObject(schema)) {
    if (schema.$ref.startsWith("#/paths/")) {
      const pathObj = $refs.get(schema.$ref);
      const node = schemaObjectTypeNode($refs, pathObj);
      return { node, id: nodeId(node) };
    }
    const refType = referenceType($refs, schema);
    return refType;
  }

  const node = schemaObjectTypeNode($refs, schema);
  return { node, id: nodeId(node) };
}

function createTypeNode(
  $refs: SwaggerParser.$Refs,
  item: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject
): ts.TypeNode {
  return isReferenceObject(item)
    ? createTypeRefOrSchemaObjectIfPathRef($refs, item)
    : schemaObjectTypeNode($refs, item);
}

export function schemaObjectTypeNode(
  $refs: SwaggerParser.$Refs,
  item: OpenAPIV3.SchemaObject
): ts.TypeNode {
  if (isAllOfObject(item) && item.allOf) {
    return ts.factory.createIntersectionTypeNode(
      item.allOf.map((allOfItem) => createTypeNode($refs, allOfItem))
    );
  }

  if (isOneOfOrAnyOfObject(item)) {
    const items = item.oneOf || item.anyOf;
    if (items) {
      return ts.factory.createUnionTypeNode(
        items.map((oneOrAnyItem) => createTypeNode($refs, oneOrAnyItem))
      );
    }
  }

  if (isArraySchemaObject(item)) {
    return ts.factory.createArrayTypeNode(createTypeNode($refs, item.items));
  }

  if (item.additionalProperties) {
    return createDictionaryType($refs, item);
  }

  if (item.properties) {
    return createLiteralNodeFromProperties($refs, item);
  }

  return nonArraySchemaObjectTypeToTs($refs, item);
}

/**
 * Create a Ref Type Alias if local reference.
 * If it's a remote reference, starting with #/path/ then
 * resolve inline and do an inline object type
 */
export function createTypeRefOrSchemaObjectIfPathRef(
  $refs: SwaggerParser.$Refs,
  item: OpenAPIV3.ReferenceObject
) {
  if (item.$ref.startsWith("#/paths/")) {
    // TODO: Instead of resolving inline, create a Type Alias instead and reference that
    const pathObj = $refs.get(item.$ref);
    return schemaObjectTypeNode($refs, pathObj);
  }

  return createTypeRefFromRef(item);
}

function createTypeRefFromRef(item: OpenAPIV3.ReferenceObject) {
  return ts.factory.createTypeReferenceNode(refToTypeName(item.$ref));
}

export function createTypeAliasDeclarationType(
  $refs: SwaggerParser.$Refs,
  item: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject
): ts.TypeNode {
  return isReferenceObject(item)
    ? createTypeRefOrSchemaObjectIfPathRef($refs, item)
    : schemaObjectTypeNode($refs, item);
}

function resolveAdditionalPropertiesType(
  $refs: SwaggerParser.$Refs,
  additionalProperties: OpenAPIV3.SchemaObject["additionalProperties"]
) {
  if (!additionalProperties) {
    return unknownTypeNode;
  }

  if (typeof additionalProperties === "boolean") {
    if (additionalProperties === true) {
      return ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
    }

    return unknownTypeNode;
  }

  return createTypeAliasDeclarationType($refs, additionalProperties);
}

// Dictionaries look like: { [key: string]: any }
export function createDictionaryType(
  $refs: SwaggerParser.$Refs,
  item: OpenAPIV3.SchemaObject
) {
  return ts.factory.createTypeLiteralNode([
    ts.factory.createIndexSignature(
      /*modifiers*/ undefined,
      /*params*/ [
        ts.factory.createParameterDeclaration(
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
      /*type*/ resolveAdditionalPropertiesType($refs, item.additionalProperties)
    ),
  ]);
}

export function nonArraySchemaObjectTypeToTs(
  $refs: SwaggerParser.$Refs,
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
        return createDictionaryType($refs, item);
      }

      return appendNullToUnion(
        createLiteralNodeFromProperties($refs, item),
        item.nullable
      );
    }
    default:
      return unknownTypeNode;
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

function referenceType(
  $refs: SwaggerParser.$Refs,
  item: OpenAPIV3.ReferenceObject
): ReturnType<typeof schemaObjectOrRefType> {
  const name = refToTypeName(item.$ref);
  return {
    node: createTypeRefOrSchemaObjectIfPathRef($refs, item),
    id: name,
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
  const parts = ref.split("/");
  const lastPart = parts[parts.length - 1];
  return sanitizeTypeName(lastPart);
}

export function createParams(
  $refs: SwaggerParser.$Refs,
  item: OpenAPIV3.OperationObject,
  pathParams: OpenAPIV3.PathItemObject["parameters"]
) {
  if (!item.parameters && !pathParams) {
    return [];
  }

  const paramObjects = combineUniqueParams($refs, pathParams, item.parameters);
  return paramObjects
    .sort((x, y) => (x.required === y.required ? 0 : x.required ? -1 : 1)) // put all optional values at the end
    .map((param) => ({
      required: param.required ?? false,
      name: ts.factory.createIdentifier(param.name),
      arrowFuncParam: ts.factory.createParameterDeclaration(
        /*modifiers*/ undefined,
        /*dotDotDotToken*/ undefined,
        /*name*/ ts.factory.createIdentifier(param.name),
        /*questionToken*/ param.required
          ? undefined
          : ts.factory.createToken(ts.SyntaxKind.QuestionToken),
        /*type*/ schemaObjectOrRefType($refs, param.schema).node,
        /*initializer*/ undefined
      ),
    }));
}

function resolveParams(
  $refs: SwaggerParser.$Refs,
  params: (OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject)[]
): OpenAPIV3.ParameterObject[] {
  return params.flatMap((p) => {
    if (isParameterObject(p)) {
      return [p];
    }
    const ref = $refs.get(p.$ref);
    if (isParameterObject(ref)) {
      return [ref];
    }

    return [];
  });
}

// Combines path and item parameters into a single unique array.
// A unique parameter is defined by a combination of a name and location.
// Item parameters override path parameters with the same name and location.
export function combineUniqueParams(
  $refs: SwaggerParser.$Refs,
  pathParams: (OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject)[] = [],
  itemParams: (OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject)[] = []
) {
  const pathParamsResolved = resolveParams($refs, pathParams);
  const itemParamsResolved = resolveParams($refs, itemParams);

  if (!pathParamsResolved.length) {
    return itemParamsResolved;
  } else if (!itemParamsResolved.length) {
    return pathParamsResolved;
  }

  const paramKey = (p: OpenAPIV3.ParameterObject) => `${p.name}-${p.in}`;
  const itemParamIds = new Set(itemParamsResolved.map(paramKey));
  return [
    ...itemParamsResolved,
    ...pathParamsResolved.filter((p) => !itemParamIds.has(paramKey(p))),
  ];
}
