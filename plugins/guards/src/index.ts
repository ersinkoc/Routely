/**
 * Routely Guards Plugin - Route guards and navigation protection.
 * @packageDocumentation
 */

import type { RouterPlugin, Router } from '@oxog/routely-core';

/**
 * Result of a guard evaluation.
 *
 * @example
 * ```typescript
 * // Simple boolean result
 * const result: GuardResult = true;
 *
 * // Result with redirect
 * const result: GuardResult = { allowed: false, redirect: '/login' };
 * ```
 */
export type GuardResult =
  | boolean
  | {
      /**
       * Whether navigation is allowed.
       */
      allowed: boolean;
      /**
       * Optional redirect path when navigation is denied.
       */
      redirect?: string;
    };

/**
 * Guard function that can be sync or async.
 *
 * @example
 * ```typescript
 * // Sync guard
 * const adminGuard: Guard = () => user.isAdmin;
 *
 * // Async guard
 * const authGuard: Guard = async () => {
 *   const session = await checkSession();
 *   return session.valid;
 * };
 * ```
 */
export type Guard = () => GuardResult | Promise<GuardResult>;

/**
 * Configuration for a route guard.
 *
 * @example
 * ```typescript
 * const guardConfig: GuardConfig = {
 *   guard: () => isAuthenticated(),
 *   redirect: '/login',
 * };
 * ```
 */
export interface GuardConfig {
  /**
   * The guard function to execute.
   */
  guard: Guard;
  /**
   * Optional redirect path when the guard fails.
   */
  redirect?: string;
}

/**
 * Guard entry in the guards configuration.
 *
 * @example
 * ```typescript
 * // Simple guard function
 * const entry1: GuardEntry = () => user.isAdmin;
 *
 * // Guard with redirect
 * const entry2: GuardEntry = {
 *   guard: () => isAuthenticated(),
 *   redirect: '/login',
 * };
 * ```
 */
export type GuardEntry = Guard | GuardConfig;

/**
 * Pattern for matching routes.
 *
 * Patterns can be:
 * - Exact path: `/admin`
 * - Wildcard: `/admin/*` matches `/admin`, `/admin/users`, etc.
 * - Parameterized: `/users/:id` matches `/users/123`
 *
 * @example
 * ```typescript
 * const patterns: GuardPattern[] = [
 *   '/admin',
 *   '/admin/*',
 *   '/users/:id',
 * ];
 * ```
 */
export type GuardPattern = string;

/**
 * Options for configuring the guards plugin.
 *
 * @example
 * ```typescript
 * router.use(guardsPlugin({
 *   '/admin': () => user.isAdmin,
 *   '/profile': {
 *     guard: () => isAuthenticated(),
 *     redirect: '/login',
 *   },
 *   '/settings/*': async () => {
 *     const session = await checkSession();
 *     return session.valid;
 *   },
 * }));
 * ```
 */
export interface GuardsPluginOptions {
  /**
   * Map of route patterns to guards.
   * Keys are route patterns, values are guard functions or configs.
   */
  guards: Record<GuardPattern, GuardEntry>;
  /**
   * Default redirect path when a guard rejects without a specific redirect.
   * @default '/'
   */
  defaultRedirect?: string;
}

/**
 * Internal guard entry with compiled pattern.
 */
interface CompiledGuardEntry {
  /**
   * Compiled pattern as regex for matching.
   */
  pattern: RegExp;
  /**
   * Whether the pattern is a wildcard (matches all sub-routes).
   */
  isWildcard: boolean;
  /**
   * The guard function.
   */
  guard: Guard;
  /**
   * Optional redirect path.
   */
  redirect?: string;
}

/**
 * Global plugin options (stored on the router).
 */
const GUARDS_PLUGIN_OPTIONS = Symbol('guards-plugin-options');

/**
 * Validate that a redirect path is safe.
 * Prevents XSS attacks via javascript: and data: URLs.
 *
 * @param path - The redirect path to validate
 * @returns true if the path is safe
 */
function isValidRedirectPath(path: string): boolean {
  if (typeof path !== 'string') {
    return false;
  }

  // Path must start with /
  if (!path.startsWith('/')) {
    return false;
  }

  // Block dangerous protocols
  const dangerousProtocols = /^(javascript|data|vbscript|file):/i;
  if (dangerousProtocols.test(path)) {
    return false;
  }

  // Block HTML entities
  if (path.includes('<') || path.includes('>')) {
    return false;
  }

  // Block on* attributes (XSS attempts)
  if (/on\w+\s*=/i.test(path)) {
    return false;
  }

  return true;
}

/**
 * Maximum allowed pattern length to prevent ReDoS attacks.
 */
const MAX_PATTERN_LENGTH = 500;

/**
 * Convert a pattern string to a regex for matching.
 *
 * @example
 * ```typescript
 * patternToRegex('/admin')     // /^\/admin$/
 * patternToRegex('/admin/*')   // /^\/admin\/.*$/
 * patternToRegex('/users/:id') // /^\/users\/([^/]+)$/
 * ```
 */
function patternToRegex(pattern: string): RegExp {
  // Validate pattern type
  if (typeof pattern !== 'string') {
    throw new TypeError(`Pattern must be a string, got ${typeof pattern}`);
  }

  // Limit pattern length to prevent ReDoS attacks
  if (pattern.length > MAX_PATTERN_LENGTH) {
    throw new Error(`Pattern too long (max ${MAX_PATTERN_LENGTH} characters): ${pattern.substring(0, 50)}...`);
  }

  // Validate pattern structure
  if (pattern.length === 0) {
    throw new Error('Pattern cannot be empty');
  }

  // Check for suspicious patterns that might cause ReDoS
  // Use string operations for better reliability
  if (/\*\*/.test(pattern)) {
    throw new Error(`Pattern contains multiple consecutive wildcards that may cause performance issues: ${pattern}`);
  }

  // Count consecutive params (e.g., :a:b:c...)
  const consecutiveParams = pattern.match(/:[^/\\s]+/g);
  if (consecutiveParams && consecutiveParams.length > 20) {
    throw new Error(`Pattern contains too many consecutive params (max 20): ${pattern}`);
  }

  // Escape special regex characters except for * and :
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');

  // Replace :param with capture group
  const withParams = escaped.replace(/:([^/\\s]+)/g, '([^/\\s]+)');

  // Replace * with optional path matching
  // /admin/* should match /admin, /admin/, and /admin/users
  let withWildcard = withParams;
  if (pattern.endsWith('/*')) {
    // For wildcard patterns, make the trailing slash and any following content optional
    const basePattern = withParams.slice(0, -2); // Remove /*
    withWildcard = `${basePattern}(?:\/.*)?`;
  }

  return new RegExp(`^${withWildcard}$`);
}

/**
 * Check if a path matches a pattern.
 *
 * @example
 * ```typescript
 * matchesPattern('/admin/users', '/admin')           // false
 * matchesPattern('/admin', '/admin')                 // true
 * matchesPattern('/admin/users', '/admin/*')         // true
 * matchesPattern('/admin/users/123', '/admin/*')     // true
 * matchesPattern('/users/123', '/users/:id')         // true
 * ```
 */
function matchesPattern(path: string, pattern: RegExp): boolean {
  return pattern.test(path);
}

/**
 * Compile guard entries for efficient matching.
 */
function compileGuards(options: GuardsPluginOptions): CompiledGuardEntry[] {
  return Object.entries(options.guards).map(([pattern, entry]) => {
    const isWildcard = pattern.endsWith('/*');
    const regex = patternToRegex(pattern);

    if (typeof entry === 'function') {
      return {
        pattern: regex,
        isWildcard,
        guard: entry,
      };
    }

    return {
      pattern: regex,
      isWildcard,
      guard: entry.guard,
      redirect: entry.redirect,
    };
  });
}

/**
 * Find matching guards for a given path.
 */
function findMatchingGuards(path: string, compiledGuards: CompiledGuardEntry[]): CompiledGuardEntry[] {
  return compiledGuards.filter((entry) => {
    // Check if pattern matches
    return matchesPattern(path, entry.pattern);
  });
}

/**
 * Normalize guard result to a consistent format.
 */
function normalizeGuardResult(result: GuardResult): { allowed: boolean; redirect?: string } {
  if (typeof result === 'boolean') {
    return { allowed: result };
  }
  return result;
}

/**
 * Create the guards plugin instance.
 *
 * This plugin enables route protection with:
 * - Sync and async guard functions
 * - Pattern matching for routes
 * - Wildcard patterns for nested routes
 * - Redirect on guard failure
 * - Default redirect configuration
 * - Redirect loop prevention
 *
 * @param options - Plugin configuration options
 * @returns A router plugin for route guards
 *
 * @example
 * ```typescript
 * import { guardsPlugin } from '@oxog/routely/plugin-guards';
 *
 * router.use(guardsPlugin({
 *   guards: {
 *     '/admin': () => user.isAdmin,
 *     '/profile': {
 *       guard: () => isAuthenticated(),
 *       redirect: '/login',
 *     },
 *     '/settings/*': async () => {
 *       const session = await checkSession();
 *       return session.valid;
 *     },
 *   },
 *   defaultRedirect: '/login',
 * }));
 *
 * // Navigate - guards will be checked automatically
 * router.navigate('/admin'); // Will be rejected if not admin
 * ```
 */
export function guardsPlugin(options: GuardsPluginOptions): RouterPlugin {
  const compiledGuards = compileGuards(options);
  const defaultRedirect = options.defaultRedirect || '/';

  // Store original navigate reference for redirect handling
  let originalNavigate: Router['navigate'] | null = null;
  let isNavigatingToRedirect = false;

  return {
    name: 'guards',
    version: '1.0.0',

    install(router: Router) {
      // Store options on the router for later access
      (router as any)[GUARDS_PLUGIN_OPTIONS] = {
        compiledGuards,
        defaultRedirect,
      };

      // Store the original navigate method before wrapping
      // This allows us to call it for redirects without triggering guards again
      if (!originalNavigate) {
        originalNavigate = router.navigate.bind(router);
      }

      // Wrap the navigate method to intercept navigation calls
      const wrappedNavigate: Router['navigate'] = async (to, options = {}) => {
        const path = typeof to === 'string' ? to : to.path;

        // Skip guard checks if we're navigating due to a redirect
        // This prevents infinite loops where:
        // 1. Route A redirects to Route B
        // 2. Route B also redirects (possibly back to A)
        if (isNavigatingToRedirect) {
          return originalNavigate!(to, options);
        }

        // Find matching guards for the target path
        const matchingGuards = findMatchingGuards(path, compiledGuards);

        // Execute all matching guards
        for (const entry of matchingGuards) {
          const result = await Promise.resolve(entry.guard());
          const normalized = normalizeGuardResult(result);

          if (!normalized.allowed) {
            // Guard rejected - redirect to configured path
            const redirect = normalized.redirect || entry.redirect || defaultRedirect;

            // Validate redirect path to prevent XSS
            if (!isValidRedirectPath(redirect)) {
              console.error(`Invalid redirect path: "${redirect}". Redirect must start with "/" and not contain dangerous protocols.`);
              isNavigatingToRedirect = true;
              try {
                return await originalNavigate!(defaultRedirect, options);
              } finally {
                isNavigatingToRedirect = false;
              }
            }

            // Prevent redirect loops
            if (redirect === path) {
              console.warn(
                `Guard redirect loop detected: trying to redirect to "${redirect}" which is the same as the target destination. ` +
                `Skipping redirect to prevent infinite loop.`
              );
              return false;
            }

            // Perform the redirect
            isNavigatingToRedirect = true;
            try {
              return await originalNavigate!(redirect, options);
            } finally {
              isNavigatingToRedirect = false;
            }
          }
        }

        // All guards passed - proceed with navigation
        return originalNavigate!(to, options);
      };

      // Replace the router's navigate method with our wrapped version
      (router as any).navigate = wrappedNavigate;
    },
  };
}

/**
 * Get the guards plugin options from a router.
 *
 * @example
 * ```typescript
 * const options = getGuardsPluginOptions(router);
 * console.log(options.compiledGuards);
 * ```
 */
export function getGuardsPluginOptions(router: Router): {
  compiledGuards: CompiledGuardEntry[];
  defaultRedirect: string;
} | undefined {
  return (router as any)[GUARDS_PLUGIN_OPTIONS];
}

/**
 * Check if a path has any guards configured.
 *
 * @example
 * ```typescript
 * if (hasGuardsForPath(router, '/admin')) {
 *   console.log('Admin route is protected');
 * }
 * ```
 */
export function hasGuardsForPath(router: Router, path: string): boolean {
  const options = getGuardsPluginOptions(router);
  if (!options) return false;

  const matchingGuards = findMatchingGuards(path, options.compiledGuards);
  return matchingGuards.length > 0;
}
