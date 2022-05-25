import ts from "typescript";
import type { OpenAPIV3 } from "openapi-types";

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

export function isSchemaObject(
  param: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject | undefined
): param is OpenAPIV3.SchemaObject {
  return param !== undefined && "type" in param;
}

export function isReferenceObject(
  item: OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject | undefined
): item is OpenAPIV3.ReferenceObject {
  return item !== undefined && "$ref" in item;
}

export function schemaObjectTypeToTS(
  objectType?:
    | OpenAPIV3.ArraySchemaObjectType
    | OpenAPIV3.NonArraySchemaObjectType
    | null
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
      // TODO: This type is not correct, just a placeholder. Never use `any`
      return ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
    case "array":
      return ts.factory.createArrayTypeNode(
        // TODO: This type is not correct, just a placeholder. Never use `any`
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
      );
    default:
      return ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);
  }
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

/**
 * Removes the path in the ref and just returns the last part, which is used as the Type name
 * @param ref The ref in the OpenAPI file
 * @returns The type name
 */
export function refToTypeName(ref: string) {
  if (ref.startsWith("#/components/schemas/")) {
    return ref.slice(21);
  }

  return ref;
}
