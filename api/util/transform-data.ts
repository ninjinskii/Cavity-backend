import { cameCase, snakeCase } from "case";
export function toSnakeCase<T>(object: T): T {
  // deno-lint-ignore no-explicit-any
  const formatted: any = {};

  for (const key in object) {
    formatted[snakeCase(key)] = object[key];
  }

  return formatted;
}

export function filterIgnoredFields<T>(
  object: T,
  ignoredFields: string[] = [],
): T {
  // deno-lint-ignore no-explicit-any
  const filtered: any = {};

  for (const key in object) {
    if (!ignoredFields.includes(key)) {
      filtered[key] = object[key];
    }
  }

  return filtered;
}

export function toCamelCase<T>(object: T): T {
  // deno-lint-ignore no-explicit-any
  const formatted: any = {};

  for (const key in object) {
    formatted[camelCase(key)] = object[key];
  }

  return formatted;
}
