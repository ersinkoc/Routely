/**
 * Router configuration constants.
 * @packageDocumentation
 */

/**
 * Maximum route path length to prevent DoS attacks.
 */
export const MAX_ROUTE_PATH_LENGTH = 500;

/**
 * Maximum metadata JSON size to prevent DoS attacks (10KB).
 */
export const MAX_METADATA_SIZE = 10000;

/**
 * Maximum navigation path length to prevent DoS attacks.
 */
export const MAX_NAVIGATION_PATH_LENGTH = 2000;

/**
 * Maximum plugin name length for sanitization.
 */
export const MAX_PLUGIN_NAME_LENGTH = 100;

/**
 * Maximum error message length for sanitization.
 */
export const MAX_ERROR_MESSAGE_LENGTH = 500;

/**
 * Maximum path length for sanitization in error messages.
 */
export const MAX_ERROR_PATH_LENGTH = 200;

/**
 * Navigation guard timeout in milliseconds (5 seconds).
 */
export const NAVIGATION_GUARD_TIMEOUT_MS = 5000;

/**
 * Default maximum cache size for RouteMatcher LRU cache.
 */
export const DEFAULT_MAX_CACHE_SIZE = 100;

/**
 * Maximum href length for Link component to prevent DoS attacks.
 */
export const MAX_HREF_LENGTH = 2000;

/**
 * Route specificity scores for ranking.
 */
export const ROUTE_SCORE = {
  STATIC: 1000,
  PARAMETER: 100,
  OPTIONAL_PARAMETER: 50,
  WILDCARD: 1,
} as const;
