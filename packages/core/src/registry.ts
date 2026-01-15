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
 * Create a route reference.
 */
function createRouteRef<TParams extends Record<string, string>>(path: string): RouteRef<TParams> {
  return {
    path,
    build: (params: TParams) => {
      return path.replace(/:([^/]+)/g, (_, key) => {
        const value = params[key as keyof TParams];
        return value !== undefined ? String(value) : `:${key}`;
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
    get(_target, prop: string) {
      const value = registry[prop];

      if (typeof value === 'string') {
        return createRouteRef(value);
      } else if (typeof value === 'object' && value !== null) {
        return createRoutes(value);
      }

      return undefined;
    },
  });

  return proxy;
}
