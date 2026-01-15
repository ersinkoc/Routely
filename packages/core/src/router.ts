/**
 * Router factory and route helper functions.
 * @packageDocumentation
 */

import type { Router, RouterOptions, RouteDefinition } from './types.js';
import { RouterKernel } from './kernel.js';
import { createBrowserHistory } from './history.js';
import { normalizeSlashes } from './utils.js';

/**
 * Create a router instance.
 *
 * @param options - Router options
 * @returns Router instance
 *
 * @example
 * ```typescript
 * const router = createRouter({
 *   routes: [
 *     route('/', Home),
 *     route('/users', Users),
 *   ],
 * });
 * ```
 */
export function createRouter(options: RouterOptions): Router {
  const history = options.history || (typeof window !== 'undefined' ? createBrowserHistory() : undefined);

  if (!history) {
    throw new Error('History is required. Provide a history instance or run in a browser environment.');
  }

  const basePath = options.basePath || '';
  const routes = flattenRoutes(options.routes, basePath);

  const kernel = new RouterKernel(routes, history, basePath);

  return kernel as unknown as Router;
}

/**
 * Create a route definition.
 *
 * @param path - Route path pattern
 * @param component - Component to render
 * @param children - Nested child routes
 * @param meta - Route metadata
 * @returns Route definition
 *
 * @example
 * ```typescript
 * route('/users', Users, [
 *   route(':id', UserDetail),
 *   route(':id/edit', UserEdit),
 * ], { requiresAuth: true });
 * ```
 */
export function route(
  path: string,
  component: any,
  children?: RouteDefinition[] | Record<string, unknown>,
  meta?: Record<string, unknown>
): RouteDefinition {
  // Handle overloaded signature
  const actualChildren = Array.isArray(children) ? children : undefined;
  const actualMeta = Array.isArray(children) ? meta : (children as Record<string, unknown> | undefined);

  const normalizedPath = normalizeSlashes(path);

  const routeDef: RouteDefinition = {
    path: normalizedPath,
    component,
  };

  if (actualChildren && actualChildren.length > 0) {
    routeDef.children = actualChildren;
  }

  if (actualMeta) {
    routeDef.meta = actualMeta;
  }

  validateRoute(routeDef);

  return routeDef;
}

/**
 * Validate a route definition.
 */
function validateRoute(route: RouteDefinition): void {
  if (!route.path) {
    throw new Error('Route path is required');
  }

  if (route.path !== '*' && !route.path.startsWith('/')) {
    throw new Error(`Route path must start with "/": ${route.path}`);
  }

  if (route.path.includes('//')) {
    throw new Error(`Route path cannot contain "//": ${route.path}`);
  }

  if (!route.component) {
    throw new Error(`Route must have a component: ${route.path}`);
  }
}

/**
 * Flatten nested routes into a flat array.
 */
function flattenRoutes(routes: RouteDefinition[], basePath: string = ''): RouteDefinition[] {
  const flattened: RouteDefinition[] = [];

  for (const route of routes) {
    const fullPath = basePath && route.path !== '*'
      ? normalizeSlashes(`${basePath}${route.path}`)
      : route.path;

    flattened.push({
      ...route,
      path: fullPath,
      children: undefined,
    });

    if (route.children) {
      const childRoutes = flattenRoutes(route.children, fullPath);
      flattened.push(...childRoutes);
    }
  }

  return flattened;
}
