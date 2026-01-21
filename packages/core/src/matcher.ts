/**
 * Route matching algorithm for Routely router.
 * @packageDocumentation
 */

import type { RouteDefinition, RouteMatch } from './types.js';
import { normalizeSlashes } from './utils.js';

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
      score += 1;
    } else if (segment.includes('*')) {
      // Segment with wildcard like :path*
      score += 50;
    } else if (segment.startsWith(':') && segment.endsWith('?')) {
      // Optional parameter
      score += 50;
    } else if (segment.startsWith(':')) {
      // Required parameter
      score += 100;
    } else {
      // Static segment
      score += 1000;
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
 * Route matcher class with caching.
 */
export class RouteMatcher {
  private cache = new Map<string, RouteMatch | null>();

  match(url: string, routes: RouteDefinition[]): RouteMatch | null {
    const cacheKey = url;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) ?? null;
    }

    const match = matchRoute(url, routes);
    this.cache.set(cacheKey, match);

    return match;
  }

  clearCache(): void {
    this.cache.clear();
  }
}
