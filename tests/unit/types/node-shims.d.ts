// Shim mínimo para compilar los tests sin @types/node (no hay acceso a npm en
// esta sesión — ver ARCHITECTURE.md). Con `npm install` real, @types/node
// provee estas mismas declaraciones y este archivo deja de hacer falta.
declare module "node:test" {
  export function test(name: string, fn: () => void | Promise<void>): void;
}

declare module "node:assert/strict" {
  interface Assert {
    (value: unknown, message?: string): void;
    equal(actual: unknown, expected: unknown, message?: string): void;
    notEqual(actual: unknown, expected: unknown, message?: string): void;
    deepEqual(actual: unknown, expected: unknown, message?: string): void;
    notDeepEqual(actual: unknown, expected: unknown, message?: string): void;
    ok(value: unknown, message?: string): void;
    throws(fn: () => void, error?: unknown, message?: string): void;
  }
  const assert: Assert;
  export default assert;
}
