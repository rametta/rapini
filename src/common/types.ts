import { OpenAPIV3 } from "openapi-types";
import ts from "typescript";
import {
  appendNullToUnion,
  createDictionaryType,
  createTypeRefFromRef,
  isAllOfObject,
  isArraySchemaObject,
  isOneOfOrAnyOfObject,
  isReferenceObject,
  nonArraySchemaObjectTypeToTs,
  sanitizeTypeName,
} from "./util";

function schemaObjectTypeToArrayType(
  item: OpenAPIV3.NonArraySchemaObject
): ts.TypeNode {
  return appendNullToUnion(nonArraySchemaObjectTypeToTs(item), item.nullable);
}

function resolveArray(item: OpenAPIV3.ArraySchemaObject): ts.TypeNode {
  if (isReferenceObject(item.items)) {
    return appendNullToUnion(
      ts.factory.createArrayTypeNode(createTypeRefFromRef(item.items)),
      item.nullable
    );
  }

  if (item.items.properties) {
    return ts.factory.createArrayTypeNode(
      createLiteralNodeFromProperties(item.items)
    );
  }

  return ts.factory.createArrayTypeNode(
    isArraySchemaObject(item.items)
      ? resolveArray(item.items)
      : schemaObjectTypeToArrayType(item.items)
  );
}

function resolveType(item: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject) {
  if (isReferenceObject(item)) {
    return createTypeRefFromRef(item);
  }

  if (isArraySchemaObject(item)) {
    return resolveArray(item);
  }

  return item.type
    ? nonArraySchemaObjectTypeToTs(item)
    : createTypeAliasDeclarationType(item);
}

function createPropertySignature(
  item: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
  name: string,
  required: boolean
) {
  return ts.factory.createPropertySignature(
    /*modifiers*/ undefined,
    /*name*/ ts.factory.createIdentifier(name),
    /*questionToken*/ required
      ? undefined
      : ts.factory.createToken(ts.SyntaxKind.QuestionToken),
    /*type*/ resolveType(item)
  );
}

function createPropertySignatures(
  item: OpenAPIV3.SchemaObject
): ts.PropertySignature[] {
  if (!item.properties) {
    return [];
  }

  return Object.entries(item.properties).map(([name, prop]) =>
    createPropertySignature(prop, name, item.required?.includes(name) ?? false)
  );
}

function createTypeAliasDeclarationTypeWithSchemaObject(
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

export function createLiteralNodeFromProperties(item: OpenAPIV3.SchemaObject) {
  return ts.factory.createTypeLiteralNode(createPropertySignatures(item));
}

function createTypeAliasDeclarationType(
  item: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject
): ts.TypeNode {
  return isReferenceObject(item)
    ? createTypeRefFromRef(item)
    : createTypeAliasDeclarationTypeWithSchemaObject(item);
}

export function makeTypes(doc: OpenAPIV3.Document) {
  const schemas = doc.components?.schemas;

  if (!schemas) {
    return [];
  }

  return Object.entries(schemas).map(([schemaName, item]) => {
    return ts.factory.createTypeAliasDeclaration(
      /*decorators*/ undefined,
      /*modifiers*/ [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      /*name*/ ts.factory.createIdentifier(sanitizeTypeName(schemaName)),
      /*typeParameters*/ undefined,
      /*type*/ createTypeAliasDeclarationType(item)
    );
  });
}
