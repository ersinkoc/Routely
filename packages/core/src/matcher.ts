/**
 * Route matching algorithm for Routely router.
 * @packageDocumentation
 */

import type { RouteDefinition, RouteMatch } from './types.js';
import { normalizeSlashes } from './utils.js';
import { DEFAULT_MAX_CACHE_SIZE, ROUTE_SCORE } from './constants.js';

/**
 * Convert a path pattern to a regular expression.
 *
 * @param path - Path pattern
 * @returns RegExp object
 */
export function pathToRegex(path: string): RegExp {
  const normalized = normalizeSlashes(path);

  if (normalized === '*' || normalized === '/*') {
    return /^\/.*$/;
  }

  let pattern = normalized.replace(/[.+?^${}()|[\]\\]/g, '\\$&');

  // Handle optional parameters (:id?)
  pattern = pattern.replace(/:([^/]+)\?/g, '(?:/([^/]+))?');

  // Handle required parameters (:id)
  pattern = pattern.replace(/:([^/]+)/g, '([^/]+)');

  // Handle wildcards
  pattern = pattern.replace(/\*/g, '(.*)');

  return new RegExp(`^${pattern}$`);
}

/**
 * Safely decode a URI component, returning the original value if decoding fails.
 */
function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    // If decoding fails (malformed URI), return the original value
    return value;
  }
}

/**
 * Extract parameter names from a path pattern.
 */
function extractParamNames(pattern: string): string[] {
  const paramNames: string[] = [];

  // Match both :param and :param? patterns
  const paramMatches = pattern.matchAll(/:([^/?]+)/g);
  for (const match of paramMatches) {
    const paramName = match[1];
    if (paramName && !paramNames.includes(paramName)) {
      paramNames.push(paramName);
    }
  }

  return paramNames;
}

/**
 * Extract parameters from a matched URL.
 */
export function extractParams(url: string, pattern: string): Record<string, string> {
  const params: Record<string, string> = {};
  const normalizedUrl = normalizeSlashes(url);
  const normalizedPattern = normalizeSlashes(pattern);

  if (!normalizedPattern.includes(':') && !normalizedPattern.includes('*')) {
    return params;
  }

  const paramNames = extractParamNames(normalizedPattern);

  const regex = pathToRegex(normalizedPattern);
  const match = regex.test(normalizedUrl) ? normalizedUrl.match(regex) : null;

  if (!match) {
    return params;
  }

  const values = Array.from(match).slice(1);

  for (let i = 0; i < paramNames.length && i < values.length; i++) {
    const paramName = paramNames[i];
    const value = values[i];
    if (paramName && value !== undefined && value !== null) {
      params[paramName] = safeDecodeURIComponent(value);
    }
  }

  return params;
}

/**
 * Calculate route specificity score.
 * Higher score = more specific route.
 *
 * Scoring:
 * - Static segments: 1000 points
 * - Parameter segments (:id): 100 points
 * - Optional parameters (:id?): 50 points
 * - Wildcards (*): 1 point
 */
export function calculateScore(path: string): number {
  let score = 0;
  const normalized = normalizeSlashes(path);
  const segments = normalized.split('/').filter((s) => s.length > 0);

  for (const segment of segments) {
    if (segment === '*') {
      score += ROUTE_SCORE.WILDCARD;
    } else if (segment.includes('*')) {
      // Segment with wildcard like :path*
      score += ROUTE_SCORE.OPTIONAL_PARAMETER;
    } else if (segment.startsWith(':') && segment.endsWith('?')) {
      // Optional parameter
      score += ROUTE_SCORE.OPTIONAL_PARAMETER;
    } else if (segment.startsWith(':')) {
      // Required parameter
      score += ROUTE_SCORE.PARAMETER;
    } else {
      // Static segment
      score += ROUTE_SCORE.STATIC;
    }
  }

  return score;
}

/**
 * Rank routes by specificity (most specific first).
 */
export function rankRoutes(routes: RouteDefinition[]): RouteDefinition[] {
  return [...routes].sort((a, b) => {
    const scoreA = calculateScore(a.path);
    const scoreB = calculateScore(b.path);
    return scoreB - scoreA;
  });
}

/**
 * Match a URL against route definitions.
 */
export function matchRoute(url: string, routes: RouteDefinition[]): RouteMatch | null {
  const normalizedUrl = normalizeSlashes(url);
  const ranked = rankRoutes(routes);

  for (const route of ranked) {
    const regex = pathToRegex(route.path);
    const isMatch = regex.test(normalizedUrl);

    if (isMatch) {
      const params = extractParams(normalizedUrl, route.path);
      return {
        route,
        params,
      };
    }
  }

  return null;
}

/**
 * Default maximum number of cached route matches.
 */
export { DEFAULT_MAX_CACHE_SIZE };

/**
 * Route matcher class with LRU caching to prevent unbounded memory growth.
 * @example
 * ```typescript
 * const matcher = new RouteMatcher();
 * const match = matcher.match('/users/123', routes);
 * ```
 */
export class RouteMatcher {
  private cache = new Map<string, RouteMatch | null>();
  private maxCacheSize: number;
  private rankedRoutesCache = new Map<string, RouteDefinition[]>();
  private lastRoutesHash: string | null = null;

  constructor(maxCacheSize: number = DEFAULT_MAX_CACHE_SIZE) {
    this.maxCacheSize = maxCacheSize;
  }

  /**
   * Generate a simple hash of routes array to detect changes.
   */
  private _getRoutesHash(routes: RouteDefinition[]): string {
    return routes.map(r => r.path).join('|');
  }

  /**
   * Get or create ranked routes cache.
   */
  private _getRankedRoutes(routes: RouteDefinition[]): RouteDefinition[] {
    const routesHash = this._getRoutesHash(routes);

    // Return cached ranked routes if routes haven't changed
    if (this.lastRoutesHash === routesHash && this.rankedRoutesCache.has(routesHash)) {
      return this.rankedRoutesCache.get(routesHash)!;
    }

    // Rank and cache the routes
    const ranked = rankRoutes(routes);
    this.rankedRoutesCache.set(routesHash, ranked);
    this.lastRoutesHash = routesHash;

    // Clear old cache entries to prevent unbounded growth
    if (this.rankedRoutesCache.size > 10) {
      const firstKey = this.rankedRoutesCache.keys().next().value;
      if (firstKey !== undefined && firstKey !== routesHash) {
        this.rankedRoutesCache.delete(firstKey);
      }
    }

    return ranked;
  }

  match(url: string, routes: RouteDefinition[]): RouteMatch | null {
    const cacheKey = url;

    // Check cache and move to end (most recently used)
    if (this.cache.has(cacheKey)) {
      const value = this.cache.get(cacheKey)!; // Non-null assertion: we checked has() above
      // Move to end to mark as recently used
      this.cache.delete(cacheKey);
      this.cache.set(cacheKey, value);
      return value;
    }

    // Use cached ranked routes for better performance
    const rankedRoutes = this._getRankedRoutes(routes);
    const match = matchRouteWithRanked(url, rankedRoutes);

    // Implement LRU eviction when cache is full
    if (this.cache.size >= this.maxCacheSize) {
      // Remove first (least recently used) entry
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(cacheKey, match);
    return match;
  }

  clearCache(): void {
    this.cache.clear();
    this.rankedRoutesCache.clear();
    this.lastRoutesHash = null;
  }

  /**
   * Get current cache size (useful for debugging/testing).
   */
  getCacheSize(): number {
    return this.cache.size;
  }
}

/**
 * Match a URL against already-ranked route definitions.
 * @internal
 */
function matchRouteWithRanked(url: string, rankedRoutes: RouteDefinition[]): RouteMatch | null {
  const normalizedUrl = normalizeSlashes(url);

  for (const route of rankedRoutes) {
    const regex = pathToRegex(route.path);
    const isMatch = regex.test(normalizedUrl);

    if (isMatch) {
      const params = extractParams(normalizedUrl, route.path);
      return {
        route,
        params,
      };
    }
  }

  return null;
}
