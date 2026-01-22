/**
 * Custom error classes for Routely router.
 * @packageDocumentation
 */

import type { Route } from './types.js';
import { MAX_ERROR_PATH_LENGTH, MAX_PLUGIN_NAME_LENGTH, MAX_ERROR_MESSAGE_LENGTH } from './constants.js';

/**
 * Router error interface for type checking.
 * @internal
 */
export interface RouterErrorShape {
  code: 'ROUTE_NOT_FOUND' | 'GUARD_REJECTED' | 'PLUGIN_ERROR';
  route?: Route;
  plugin?: string;
}

/**
 * Base router error class.
 *
 * @example
 * ```typescript
 * throw new RouterError('ROUTE_NOT_FOUND', 'Route not found');
 * ```
 */
export class RouterError extends Error implements RouterErrorShape {
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
  // Validate path parameter
  if (path === null || path === undefined) {
    return new RouterError('ROUTE_NOT_FOUND', 'No route found for path: (null or undefined)');
  }

  const pathStr = String(path);

  // Sanitize path to prevent potential injection in error messages
  const sanitizedPath = pathStr
    .replace(/\0/g, '') // Remove null bytes
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .slice(0, MAX_ERROR_PATH_LENGTH); // Limit length

  return new RouterError('ROUTE_NOT_FOUND', `No route found for path: ${sanitizedPath}`);
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
  // Validate route parameter
  if (!route || typeof route !== 'object') {
    return new RouterError(
      'GUARD_REJECTED',
      'Navigation was rejected by guard',
      undefined,
      typeof plugin === 'string' ? plugin : undefined
    );
  }

  // Validate and sanitize plugin name
  let sanitizedPlugin = '(unknown)';
  if (plugin && typeof plugin === 'string') {
    sanitizedPlugin = plugin
      .replace(/\0/g, '')
      .replace(/[\x00-\x1F\x7F]/g, '')
      .slice(0, MAX_PLUGIN_NAME_LENGTH);
  }

  // Sanitize route path
  const path = route.path || '(unknown)';
  const sanitizedPath = String(path)
    .replace(/\0/g, '')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .slice(0, MAX_ERROR_PATH_LENGTH);

  return new RouterError(
    'GUARD_REJECTED',
    `Navigation to ${sanitizedPath} was rejected by guard`,
    route,
    sanitizedPlugin
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
  // Validate plugin parameter
  if (!plugin || typeof plugin !== 'string') {
    return new RouterError(
      'PLUGIN_ERROR',
      `Plugin threw an error: ${originalError?.message || 'Unknown error'}`,
      undefined,
      '(unknown)'
    );
  }

  // Sanitize plugin name
  const sanitizedPlugin = plugin
    .replace(/\0/g, '') // Remove null bytes
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .slice(0, MAX_PLUGIN_NAME_LENGTH); // Limit length

  // Sanitize error message
  const errorMessage = originalError?.message || 'Unknown error';
  const sanitizedMessage = errorMessage
    .replace(/\0/g, '')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .slice(0, MAX_ERROR_MESSAGE_LENGTH);

  return new RouterError(
    'PLUGIN_ERROR',
    `Plugin "${sanitizedPlugin}" threw an error: ${sanitizedMessage}`,
    undefined,
    sanitizedPlugin
  );
}
