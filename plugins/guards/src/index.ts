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
const GUARDS_PLUGIN_OPTIONS = Symbol.for('guards-plugin-options');

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

  return {
    name: 'guards',
    version: '1.0.0',

    install(router: Router) {
      // Store options on the router for later access
      (router as any)[GUARDS_PLUGIN_OPTIONS] = {
        compiledGuards,
        defaultRedirect,
      };

      // Hook into the router's navigation
      const originalNavigate = router.navigate.bind(router);
      router.navigate = async (to: string, navigateOptions?: any) => {
        // Find matching guards for the target path
        const matchingGuards = findMatchingGuards(to, compiledGuards);

        // Execute all matching guards
        for (const entry of matchingGuards) {
          const result = await Promise.resolve(entry.guard());
          const normalized = normalizeGuardResult(result);

          if (!normalized.allowed) {
            // Guard rejected - redirect
            const redirect = normalized.redirect || entry.redirect || defaultRedirect;

            // Call original navigate with redirect
            return originalNavigate(redirect, navigateOptions);
          }
        }

        // All guards passed - proceed with navigation
        return originalNavigate(to, navigateOptions);
      };
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
