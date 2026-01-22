/**
 * Type-safe route registry with param inference.
 * @packageDocumentation
 */

import type { ExtractParams, RouteRef } from './types.js';

/**
 * Route registry structure.
 */
export interface RouteRegistry {
  [key: string]: string | RouteRegistry;
}

/**
 * Typed routes generated from registry.
 */
export type TypedRoutes<T extends RouteRegistry> = {
  [K in keyof T]: T[K] extends string
    ? RouteRef<ExtractParams<T[K]>>
    : T[K] extends RouteRegistry
    ? TypedRoutes<T[K]>
    : never;
};

/**
 * Blocked property names to prevent prototype pollution.
 */
const BLOCKED_PROPS = new Set([
  '__proto__',
  'constructor',
  'prototype',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toString',
  'toLocaleString',
  'valueOf',
]);

/**
 * Check if we're in development mode.
 */
const isDevelopment = typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';

/**
 * Create a route reference.
 */
function createRouteRef<TParams extends Record<string, string>>(path: string): RouteRef<TParams> {
  return {
    path,
    build: (params: TParams) => {
      return path.replace(/:([^/]+)/g, (_, key) => {
        const value = params[key as keyof TParams];
        // Check for null AND undefined (null would become "null" string)
        return value != null ? String(value) : `:${key}`;
      });
    },
    toString: () => path,
  };
}

/**
 * Create type-safe routes from registry.
 *
 * @param registry - Route registry object
 * @returns Typed routes
 *
 * @example
 * ```typescript
 * const routes = createRoutes({
 *   home: '/',
 *   users: {
 *     list: '/users',
 *     detail: '/users/:id',
 *   },
 * });
 *
 * // Type-safe navigation
 * navigate(routes.users.detail, { id: '123' });
 * ```
 */
export function createRoutes<T extends RouteRegistry>(registry: T): TypedRoutes<T> {
  const proxy = new Proxy({} as TypedRoutes<T>, {
    get(_target, prop: string | symbol) {
      // Block prototype pollution and dangerous properties
      if (typeof prop === 'string' && BLOCKED_PROPS.has(prop)) {
        throw new Error(`Cannot access blocked property: "${prop}"`);
      }

      // Also block symbol access for security
      if (typeof prop === 'symbol') {
        return undefined;
      }

      const value = registry[prop];

      if (typeof value === 'string') {
        return createRouteRef(value);
      } else if (typeof value === 'object' && value !== null) {
        return createRoutes(value);
      }

      // In development, warn about invalid registry access
      if (isDevelopment && value === undefined) {
        console.warn(
          `Accessing undefined route property: "${String(prop)}". ` +
          `This may be a typo in your route registry.`
        );
      }

      // Return undefined for invalid registry values instead of throwing
      return undefined;
    },
  });

  return proxy;
}
