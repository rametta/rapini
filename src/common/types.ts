import { OpenAPIV3 } from "openapi-types";
import ts from "typescript";
import {
  addQuotesWhenHasDashes,
  appendNullToUnion,
  createTypeAliasDeclarationType,
  createTypeRefOrSchemaObjectIfPathRef,
  isArraySchemaObject,
  isReferenceObject,
  nonArraySchemaObjectTypeToTs,
  sanitizeTypeName,
} from "./util";
import SwaggerParser from "@apidevtools/swagger-parser";

function schemaObjectTypeToArrayType(
  $refs: SwaggerParser.$Refs,
  item: OpenAPIV3.NonArraySchemaObject
): ts.TypeNode {
  return appendNullToUnion(
    nonArraySchemaObjectTypeToTs($refs, item),
    item.nullable
  );
}

function resolveArray(
  $refs: SwaggerParser.$Refs,
  item: OpenAPIV3.ArraySchemaObject
): ts.TypeNode {
  if (isReferenceObject(item.items)) {
    return appendNullToUnion(
      ts.factory.createArrayTypeNode(
        createTypeRefOrSchemaObjectIfPathRef($refs, item.items)
      ),
      item.nullable
    );
  }

  if (item.items.properties) {
    return ts.factory.createArrayTypeNode(
      createLiteralNodeFromProperties($refs, item.items)
    );
  }

  return ts.factory.createArrayTypeNode(
    isArraySchemaObject(item.items)
      ? resolveArray($refs, item.items)
      : schemaObjectTypeToArrayType($refs, item.items)
  );
}

function resolveType(
  $refs: SwaggerParser.$Refs,
  item: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject
) {
  if (isReferenceObject(item)) {
    return createTypeAliasDeclarationType($refs, item);
  }

  if (isArraySchemaObject(item)) {
    return resolveArray($refs, item);
  }

  return item.type
    ? nonArraySchemaObjectTypeToTs($refs, item)
    : createTypeAliasDeclarationType($refs, item);
}

function createPropertySignature(
  $refs: SwaggerParser.$Refs,
  item: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject,
  name: string,
  required: boolean
) {
  return ts.factory.createPropertySignature(
    /*modifiers*/ undefined,
    /*name*/ ts.factory.createIdentifier(addQuotesWhenHasDashes(name)),
    /*questionToken*/ required
      ? undefined
      : ts.factory.createToken(ts.SyntaxKind.QuestionToken),
    /*type*/ resolveType($refs, item)
  );
}

function createPropertySignatures(
  $refs: SwaggerParser.$Refs,
  item: OpenAPIV3.SchemaObject
): ts.PropertySignature[] {
  if (!item.properties) {
    return [];
  }

  return Object.entries(item.properties).map(([name, prop]) =>
    createPropertySignature(
      $refs,
      prop,
      name,
      item.required?.includes(name) ?? false
    )
  );
}

export function createLiteralNodeFromProperties(
  $refs: SwaggerParser.$Refs,
  item: OpenAPIV3.SchemaObject
) {
  return ts.factory.createTypeLiteralNode(
    createPropertySignatures($refs, item)
  );
}

export function makeTypes($refs: SwaggerParser.$Refs, doc: OpenAPIV3.Document) {
  const schemas = doc.components?.schemas ?? [];

  return Object.entries(schemas).map(([schemaName, item]) => {
    return ts.factory.createTypeAliasDeclaration(
      /*modifiers*/ [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      /*name*/ ts.factory.createIdentifier(sanitizeTypeName(schemaName)),
      /*typeParameters*/ undefined,
      /*type*/ createTypeAliasDeclarationType($refs, item)
    );
  });
}
