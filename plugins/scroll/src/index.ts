/**
 * Routely Scroll Plugin - Scroll behavior management.
 * @packageDocumentation
 */

import type { RouterPlugin } from '@oxog/routely-core';
import type { Router } from '@oxog/routely-core';

/**
 * Options for configuring the scroll plugin.
 *
 * @example
 * ```typescript
 * router.use(scrollPlugin({
 *   behavior: 'smooth',
 *   exclude: ['/no-scroll', '/modal/*'],
 * }));
 * ```
 */
export interface ScrollPluginOptions {
  /**
   * Scroll behavior to use.
   * - 'auto': Instant scroll (default)
   * - 'smooth': Animated scroll
   * @default 'auto'
   */
  behavior?: ScrollBehavior;

  /**
   * Horizontal scroll position to use when scrolling to top.
   * @default 0
   */
  scrollX?: number;

  /**
   * Vertical scroll position to use when scrolling to top.
   * @default 0
   */
  scrollY?: number;

  /**
   * Route patterns to exclude from scroll-to-top behavior.
   * Supports exact paths (/settings) and wildcards (/modal/*).
   * @example
   * ```typescript
   * exclude: ['/no-scroll', '/modal/*', '/tabs/*']
   * ```
   */
  exclude?: string[];
}

/**
 * Saved scroll position for a route.
 */
interface SavedScrollPosition {
  x: number;
  y: number;
}

/**
 * Global plugin options (stored on the router).
 */
const SCROLL_PLUGIN_OPTIONS = Symbol.for('scroll-plugin-options');

/**
 * Storage key for saved scroll positions.
 */
const SCROLL_POSITIONS_KEY = Symbol.for('scroll-positions');

/**
 * Normalize a path for use as a storage key.
 */
function normalizePath(path: string): string {
  const parts = path.split('?');
  if (!parts[0]) return '';
  const withoutQuery = parts[0];
  const hashParts = withoutQuery.split('#');
  return hashParts[0] || '';
}

/**
 * Check if a path matches an exclusion pattern.
 */
function isExcluded(path: string, exclude: string[]): boolean {
  const normalizedPath = normalizePath(path);

  for (const pattern of exclude) {
    if (pattern === normalizedPath) {
      return true;
    }

    if (pattern.endsWith('/*')) {
      const basePath = pattern.slice(0, -2);
      if (normalizedPath === basePath || normalizedPath.startsWith(basePath + '/')) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Get current scroll position.
 */
function getScrollPosition(): SavedScrollPosition {
  return {
    x: window.scrollX,
    y: window.scrollY,
  };
}

/**
 * Restore scroll position.
 */
function restoreScrollPosition(position: SavedScrollPosition, options: ScrollBehavior = 'auto'): void {
  window.scrollTo({
    left: position.x,
    top: position.y,
    behavior: options,
  });
}

/**
 * Scroll to a specific position.
 */
function scrollToPosition(x: number, y: number, behavior: ScrollBehavior = 'auto'): void {
  window.scrollTo({
    left: x,
    top: y,
    behavior,
  });
}

/**
 * Get scroll positions storage from router.
 */
function getScrollPositions(router: Router): Map<string, SavedScrollPosition> {
  return (router as any)[SCROLL_POSITIONS_KEY] || new Map();
}

/**
 * Set scroll positions storage on router.
 */
function setScrollPositions(router: Router, positions: Map<string, SavedScrollPosition>): void {
  (router as any)[SCROLL_POSITIONS_KEY] = positions;
}

/**
 * Get scroll plugin options from router.
 */
export function getScrollPluginOptions(router: Router): ScrollPluginOptions | undefined {
  return (router as any)[SCROLL_PLUGIN_OPTIONS];
}

/**
 * Create the scroll plugin instance.
 *
 * This plugin manages scroll behavior during navigation:
 * - Saves scroll position before navigation
 * - Restores scroll position on back/forward navigation
 * - Scrolls to top on new navigation (unless excluded)
 * - Supports route exclusion patterns
 * - Configurable scroll behavior (auto/smooth)
 *
 * @param options - Plugin configuration options
 * @returns A router plugin for scroll management
 *
 * @example
 * ```typescript
 * import { scrollPlugin } from '@oxog/routely-plugin-scroll';
 *
 * // Basic usage - scroll to top on navigation
 * router.use(scrollPlugin());
 *
 * // With smooth scrolling
 * router.use(scrollPlugin({ behavior: 'smooth' }));
 *
 * // Exclude certain routes from scroll-to-top
 * router.use(scrollPlugin({
 *   exclude: ['/modal/*', '/tabs/*', '/settings'],
 * }));
 *
 * // Custom scroll position
 * router.use(scrollPlugin({
 *   scrollX: 0,
 *   scrollY: 100,
 * }));
 * ```
 */
export function scrollPlugin(options: ScrollPluginOptions = {}): RouterPlugin {
  const behavior = options.behavior ?? 'auto';
  const scrollX = options.scrollX ?? 0;
  const scrollY = options.scrollY ?? 0;
  const exclude = options.exclude ?? [];

  // Store router reference for cleanup
  let routerRef: Router | undefined;

  return {
    name: 'scroll',
    version: '1.0.0',

    install(router: Router) {
      // Store options on the router with defaults applied
      (router as any)[SCROLL_PLUGIN_OPTIONS] = {
        behavior,
        scrollX,
        scrollY,
        exclude,
      };

      // Initialize scroll positions storage
      setScrollPositions(router, new Map());

      // Track navigation direction for scroll restoration
      let navigationDirection: 'forward' | 'backward' | 'new' = 'new';

      // Wrap navigate to track navigation direction
      const originalNavigate = (router as any)._originalNavigate ?? router.navigate.bind(router);

      // Store original navigate before overriding
      if (!(router as any)._originalNavigate) {
        (router as any)._originalNavigate = originalNavigate;
      }

      (router as any).navigate = async (to: string, navigateOptions?: any) => {
        // IMPORTANT: Get currentPath BEFORE calling originalNavigate
        // because currentRoute will be updated after navigation completes
        const currentPath = normalizePath(router.currentRoute?.path || '');
        const toPath = normalizePath(to);

        // Save current scroll position before navigation
        if (currentPath) {
          const positions = getScrollPositions(router);
          positions.set(currentPath, getScrollPosition());
          setScrollPositions(router, positions);
        }

        // Determine navigation direction
        if (navigateOptions?.delta) {
          // This is a back/forward navigation
          navigationDirection = navigateOptions.delta < 0 ? 'backward' : 'forward';
        } else {
          // Check if we've been to this route before
          const positions = getScrollPositions(router);
          navigationDirection = positions.has(toPath) ? 'backward' : 'new';
        }

        return originalNavigate(to, navigateOptions);
      };

      // Listen to after navigation events to handle scroll behavior
      const unsubscribe = router.on('afterNavigate', () => {
        const currentPath = normalizePath(router.currentRoute?.path || '');

        if (!currentPath) {
          return;
        }

        // Check if this route is excluded from scroll-to-top
        const shouldExclude = isExcluded(currentPath, exclude);

        if (navigationDirection === 'backward') {
          // Restore scroll position for back navigation
          const positions = getScrollPositions(router);
          const savedPosition = positions.get(currentPath);

          if (savedPosition) {
            restoreScrollPosition(savedPosition, behavior);
          } else {
            scrollToPosition(scrollX, scrollY, behavior);
          }
        } else if (navigationDirection === 'new' || navigationDirection === 'forward') {
          // Scroll to top for new/forward navigation (unless excluded)
          if (!shouldExclude) {
            scrollToPosition(scrollX, scrollY, behavior);
          }
        }

        // Reset navigation direction
        navigationDirection = 'new';
      });

      // Store unsubscribe for cleanup
      (router as any)[Symbol.for('scroll-plugin-unsubscribe')] = unsubscribe;
      routerRef = router;
    },

    onDestroy() {
      if (routerRef) {
        const unsubscribe = (routerRef as any)[Symbol.for('scroll-plugin-unsubscribe')];
        if (unsubscribe) {
          unsubscribe();
        }
        // Clean up scroll positions storage
        setScrollPositions(routerRef, new Map());
      }
    },
  };
}

/**
 * Manually save the current scroll position for a route.
 *
 * @example
 * ```typescript
 * import { saveScrollPosition } from '@oxog/routely-plugin-scroll';
 *
 * // Save current scroll position
 * saveScrollPosition(router);
 * ```
 */
export function saveScrollPosition(router: Router): void {
  const currentPath = normalizePath(router.currentRoute?.path || '');
  if (currentPath) {
    const positions = getScrollPositions(router);
    positions.set(currentPath, getScrollPosition());
    setScrollPositions(router, positions);
  }
}

/**
 * Manually restore scroll position for current route.
 *
 * @example
 * ```typescript
 * import { restoreScroll } from '@oxog/routely-plugin-scroll';
 *
 * // Restore saved scroll position
 * restoreScroll(router);
 * ```
 */
export function restoreScroll(router: Router): void {
  const currentPath = normalizePath(router.currentRoute?.path || '');
  if (!currentPath) {
    return;
  }

  const positions = getScrollPositions(router);
  const savedPosition = positions.get(currentPath);
  const options = getScrollPluginOptions(router);

  if (savedPosition) {
    restoreScrollPosition(savedPosition, options?.behavior ?? 'auto');
  }
}

/**
 * Scroll to top manually.
 *
 * @example
 * ```typescript
 * import { scrollToTop } from '@oxog/routely-plugin-scroll';
 *
 * // Scroll to top
 * scrollToTop(router);
 * ```
 */
export function scrollToTop(router: Router): void {
  const options = getScrollPluginOptions(router);
  const scrollX = options?.scrollX ?? 0;
  const scrollY = options?.scrollY ?? 0;
  const behavior = options?.behavior ?? 'auto';

  scrollToPosition(scrollX, scrollY, behavior);
}
