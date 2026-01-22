/**
 * Router factory and route helper functions.
 * @packageDocumentation
 */

import type { Router, RouterOptions, RouteDefinition } from './types.js';
import { RouterKernel } from './kernel.js';
import { createBrowserHistory } from './history.js';
import { normalizeSlashes } from './utils.js';
import { MAX_ROUTE_PATH_LENGTH, MAX_METADATA_SIZE } from './constants.js';

/**
 * Check if we're in development mode.
 */
const isDevelopment = typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';

/**
 * Validate router options.
 * @internal
 */
function validateRouterOptions(options: RouterOptions): void {
  if (!options || typeof options !== 'object') {
    throw new TypeError('Router options must be an object');
  }

  if (!Array.isArray(options.routes)) {
    throw new TypeError('Router routes must be an array');
  }

  // Note: Empty routes array is allowed for testing purposes
  // The router will simply not match any routes

  if (options.basePath !== undefined) {
    if (typeof options.basePath !== 'string') {
      throw new TypeError('Base path must be a string');
    }
    if (options.basePath && !options.basePath.startsWith('/')) {
      throw new Error('Base path must start with "/"');
    }
  }

  // In development, check for duplicate routes
  if (isDevelopment && options.routes.length > 0) {
    const seenPaths = new Set<string>();
    const checkForDuplicates = (routes: RouteDefinition[], prefix = '') => {
      for (const route of routes) {
        const fullPath = prefix ? normalizeSlashes(`${prefix}${route.path}`) : route.path;
        if (seenPaths.has(fullPath)) {
          console.warn(`Duplicate route detected: "${fullPath}". Multiple routes with the same path may cause unexpected behavior.`);
        }
        seenPaths.add(fullPath);
        if (route.children) {
          checkForDuplicates(route.children, fullPath);
        }
      }
    };
    checkForDuplicates(options.routes);
  }
}

/**
 * Create a router instance.
 *
 * @typeParam T - Component type for type-safe routing (defaults to unknown)
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
export function createRouter<T = unknown>(options: RouterOptions<T>): Router<T> {
  // Validate options before processing
  validateRouterOptions(options);

  const history = options.history || (typeof window !== 'undefined' ? createBrowserHistory() : undefined);

  if (!history) {
    throw new Error('History is required. Provide a history instance or run in a browser environment.');
  }

  const basePath = options.basePath || '';
  const routes = flattenRoutes(options.routes, basePath);

  // RouterKernel already implements Router<T>, return it directly
  // No need for Proxy wrapper - it was adding unnecessary overhead
  return new RouterKernel<T>(routes, history, basePath);
}

/**
 * Validate route path for security and correctness.
 * @internal
 */
function validateRoutePath(path: string): void {
  // Check path length
  if (path.length > MAX_ROUTE_PATH_LENGTH) {
    throw new Error(`Route path too long (max ${MAX_ROUTE_PATH_LENGTH} characters)`);
  }

  // Check for suspicious patterns that might cause ReDoS
  const consecutiveWildcards = /\*{3,}/;
  if (consecutiveWildcards.test(path)) {
    throw new Error(`Route path contains invalid wildcard pattern: ${path}`);
  }

  // Check for multiple consecutive slashes
  const consecutiveSlashes = /\/{3,}/;
  if (consecutiveSlashes.test(path)) {
    throw new Error(`Route path contains invalid slash pattern: ${path}`);
  }

  // Check for null bytes (path traversal attempt)
  if (path.includes('\0')) {
    throw new Error('Route path cannot contain null bytes');
  }

  // Check for suspicious characters that might indicate injection attempts
  const suspiciousChars = /[\x00-\x1F\x7F]/;
  if (suspiciousChars.test(path)) {
    throw new Error('Route path contains invalid control characters');
  }
}

/**
 * Validate route metadata.
 * @internal
 */
function validateRouteMeta(meta: Record<string, unknown>): void {
  // Check for prototype pollution attempts - only check own properties
  // Using Object.prototype.hasOwnProperty to detect direct __proto__ assignment
  const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
  for (const key of dangerousKeys) {
    if (Object.prototype.hasOwnProperty.call(meta, key)) {
      throw new Error(`Route metadata cannot contain "${key}" as direct property (prototype pollution detected)`);
    }
  }

  // Check for excessively large metadata
  const json = JSON.stringify(meta);
  if (json.length > MAX_METADATA_SIZE) {
    throw new Error('Route metadata too large (max 10KB)');
  }
}

/**
 * Create a route definition.
 *
 * @typeParam T - Component type for type-safe routing
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
export function route<T>(
  path: string,
  component: T,
  children?: RouteDefinition<T>[] | Record<string, unknown>,
  meta?: Record<string, unknown>
): RouteDefinition<T> {
  // Validate component first (fail fast)
  if (!component) {
    throw new Error('Route must have a component');
  }

  // Validate path
  if (!path || typeof path !== 'string') {
    throw new Error('Route path must be a non-empty string');
  }

  // Validate path for security issues
  validateRoutePath(path);

  // Handle overloaded signature
  const actualChildren = Array.isArray(children) ? children : undefined;
  const actualMeta = Array.isArray(children) ? meta : (children as Record<string, unknown> | undefined);

  // Normalize path BEFORE validation
  const normalizedPath = normalizeSlashes(path);

  // Validate normalized path
  if (normalizedPath !== '*' && !normalizedPath.startsWith('/')) {
    throw new Error(`Route path must start with "/" or be "*": ${path}`);
  }

  // Development mode warnings for common issues
  if (isDevelopment) {
    // Check for trailing slash in non-root paths
    if (path.endsWith('/') && path !== '/') {
      console.warn(`Route path "${path}" has a trailing slash. This will be normalized to "${normalizedPath}". Consider using the normalized path directly.`);
    }

    // Check for multiple consecutive slashes (already normalized, but warn user)
    if (path !== normalizedPath && /\/{2,}/.test(path)) {
      console.warn(`Route path "${path}" contains multiple consecutive slashes. This will be normalized to "${normalizedPath}". Consider using the normalized path directly.`);
    }

    // Check for optional params with required params in same segment
    if (/:.+?\?./.test(normalizedPath)) {
      console.warn(`Route path "${normalizedPath}" has optional parameters mixed with other content in the same segment. This may cause unexpected matching behavior.`);
    }

    // Check for wildcards in non-catchall routes
    if (normalizedPath.includes('*') && normalizedPath !== '*' && !normalizedPath.endsWith('/*')) {
      console.warn(`Route path "${normalizedPath}" contains a wildcard in the middle. Wildcards are typically only supported at the end for catchall routes.`);
    }
  }

  const routeDef: RouteDefinition<T> = {
    path: normalizedPath,
    component,
  };

  if (actualChildren && actualChildren.length > 0) {
    routeDef.children = actualChildren;
  }

  if (actualMeta) {
    // Validate metadata for security issues
    validateRouteMeta(actualMeta);
    routeDef.meta = actualMeta;
  }

  return routeDef;
}

/**
 * Flatten nested routes into a flat array.
 * @internal
 */
function flattenRoutes<T>(routes: RouteDefinition<T>[], basePath: string = ''): RouteDefinition<T>[] {
  const flattened: RouteDefinition<T>[] = [];

  for (const route of routes) {
    const fullPath = basePath && route.path !== '*'
      ? normalizeSlashes(`${basePath}${route.path}`)
      : route.path;

    // Create a new route object without mutating the original
    flattened.push({
      path: fullPath,
      component: route.component,
      meta: route.meta,
    });

    if (route.children) {
      const childRoutes = flattenRoutes(route.children, fullPath);
      flattened.push(...childRoutes);
    }
  }

  return flattened;
}
