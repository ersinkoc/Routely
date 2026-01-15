/**
 * Custom error classes for Routely router.
 * @packageDocumentation
 */

import type { Route, RouterError as IRouterError } from './types.js';

/**
 * Base router error class.
 *
 * @example
 * ```typescript
 * throw new RouterError('ROUTE_NOT_FOUND', 'Route not found');
 * ```
 */
export class RouterError extends Error implements IRouterError {
  public readonly code: 'ROUTE_NOT_FOUND' | 'GUARD_REJECTED' | 'PLUGIN_ERROR';
  public readonly route?: Route;
  public readonly plugin?: string;

  constructor(
    code: 'ROUTE_NOT_FOUND' | 'GUARD_REJECTED' | 'PLUGIN_ERROR',
    message: string,
    route?: Route,
    plugin?: string
  ) {
    super(message);
    this.name = 'RouterError';
    this.code = code;
    this.route = route;
    this.plugin = plugin;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RouterError);
    }
  }
}

/**
 * Creates a route not found error.
 *
 * @param path - The path that was not found
 * @returns RouterError instance
 *
 * @example
 * ```typescript
 * throw createNotFoundError('/users/123');
 * ```
 */
export function createNotFoundError(path: string): RouterError {
  return new RouterError('ROUTE_NOT_FOUND', `No route found for path: ${path}`);
}

/**
 * Creates a guard rejection error.
 *
 * @param route - The route that was blocked
 * @param plugin - The plugin that rejected the navigation
 * @returns RouterError instance
 *
 * @example
 * ```typescript
 * throw createGuardError(route, 'auth-guard');
 * ```
 */
export function createGuardError(route: Route, plugin: string): RouterError {
  return new RouterError(
    'GUARD_REJECTED',
    `Navigation to ${route.path} was rejected by guard`,
    route,
    plugin
  );
}

/**
 * Creates a plugin error.
 *
 * @param plugin - The plugin that threw the error
 * @param originalError - The original error
 * @returns RouterError instance
 *
 * @example
 * ```typescript
 * throw createPluginError('my-plugin', new Error('Plugin failed'));
 * ```
 */
export function createPluginError(plugin: string, originalError: Error): RouterError {
  return new RouterError(
    'PLUGIN_ERROR',
    `Plugin "${plugin}" threw an error: ${originalError.message}`,
    undefined,
    plugin
  );
}
