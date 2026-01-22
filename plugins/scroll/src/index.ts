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

  /**
   * Maximum number of scroll positions to store.
   * Uses LRU eviction when limit is reached.
   * @default 50
   */
  maxScrollPositions?: number;
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
const SCROLL_PLUGIN_OPTIONS = Symbol('scroll-plugin-options');

/**
 * Storage key for saved scroll positions.
 */
const SCROLL_POSITIONS_KEY = Symbol('scroll-positions');

/**
 * Internal storage key for scroll plugin unsubscribe function.
 */
const SCROLL_PLUGIN_UNSUBSCRIBE_KEY = Symbol('scroll-plugin-unsubscribe');

/**
 * Internal storage key for navigation direction.
 */
const SCROLL_NAVIGATION_DIRECTION_KEY = Symbol('scroll-navigation-direction');

/**
 * Check if scroll positions cache is initialized on a router.
 * @internal
 */
export function _hasScrollPositions(router: Router): boolean {
  return typeof (router as any)[SCROLL_POSITIONS_KEY] !== 'undefined';
}

/**
 * Get scroll positions cache from router (internal).
 * @internal
 */
export function _getScrollPositionsInternal(router: Router): ScrollPositionCache | undefined {
  return (router as any)[SCROLL_POSITIONS_KEY];
}

/**
 * LRU Cache for scroll positions.
 * Automatically evicts oldest entries when capacity is reached.
 * @internal
 */
export class ScrollPositionCache {
  private cache = new Map<string, SavedScrollPosition>();
  private maxEntries: number;

  constructor(maxEntries: number = 50) {
    this.maxEntries = maxEntries;
  }

  /**
   * Get a scroll position by path.
   * Also updates recency (most recently used).
   */
  get(path: string): SavedScrollPosition | undefined {
    const value = this.cache.get(path);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(path);
      this.cache.set(path, value);
    }
    return value;
  }

  /**
   * Set a scroll position for a path.
   * Evicts oldest entry if capacity is reached.
   */
  set(path: string, position: SavedScrollPosition): void {
    // Remove existing entry if present (will be re-added at end)
    if (this.cache.has(path)) {
      this.cache.delete(path);
    }
    // Evict oldest entry if at capacity
    else if (this.cache.size >= this.maxEntries) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    // Add new entry (most recently used at end)
    this.cache.set(path, position);
  }

  /**
   * Check if a path exists in cache.
   */
  has(path: string): boolean {
    return this.cache.has(path);
  }

  /**
   * Get the current size of the cache.
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Clear all entries.
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get all paths in the cache (in order from least to most recently used).
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Convert to a plain Map for serialization.
   */
  toMap(): Map<string, SavedScrollPosition> {
    return new Map(this.cache);
  }
}

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
 * Get scroll positions cache from router.
 */
function getScrollPositions(router: Router): ScrollPositionCache {
  return (router as any)[SCROLL_POSITIONS_KEY];
}

/**
 * Set scroll positions cache on router.
 */
function setScrollPositions(router: Router, cache: ScrollPositionCache): void {
  (router as any)[SCROLL_POSITIONS_KEY] = cache;
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
  const maxScrollPositions = options.maxScrollPositions ?? 50;

  // Store router reference for cleanup
  let routerRef: Router | undefined;
  let afterNavigateUnsubscribe: (() => void) | null = null;

  // Get navigation direction from router state
  const getNavigationDirection = (): 'forward' | 'backward' | 'new' => {
    if (!routerRef) return 'new';
    return (routerRef as any)[SCROLL_NAVIGATION_DIRECTION_KEY] || 'new';
  };

  // Set navigation direction on router state
  const setNavigationDirection = (direction: 'forward' | 'backward' | 'new') => {
    if (routerRef) {
      (routerRef as any)[SCROLL_NAVIGATION_DIRECTION_KEY] = direction;
    }
  };

  return {
    name: 'scroll',
    version: '1.0.0',

    install(router: Router) {
      routerRef = router;

      // Store options on the router with defaults applied
      (router as any)[SCROLL_PLUGIN_OPTIONS] = {
        behavior,
        scrollX,
        scrollY,
        exclude,
        maxScrollPositions,
      };

      // Initialize scroll positions cache with LRU eviction
      setScrollPositions(router, new ScrollPositionCache(maxScrollPositions));

      // Initialize navigation direction
      setNavigationDirection('new');

      // Hook into beforeNavigate to save scroll position and track direction
      const beforeNavigateUnsubscribe = router.on('beforeNavigate', async (to, _from) => {
        const currentPath = normalizePath(router.currentRoute?.path || '');
        const toPath = normalizePath(to.path);

        // Save current scroll position before navigation
        if (currentPath) {
          const positions = getScrollPositions(router);
          positions.set(currentPath, getScrollPosition());
        }

        // Determine navigation direction
        // Note: We use the presence of cached scroll position as a heuristic
        const positions = getScrollPositions(router);
        const direction = positions.has(toPath) ? 'backward' : 'new';
        setNavigationDirection(direction);

        // Always allow navigation
        return true;
      });

      // Listen to after navigation events to handle scroll behavior
      afterNavigateUnsubscribe = router.on('afterNavigate', () => {
        const currentPath = normalizePath(router.currentRoute?.path || '');

        if (!currentPath) {
          return;
        }

        const navigationDirection = getNavigationDirection();

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
        } else if (navigationDirection === 'new') {
          // Scroll to top for new navigation (unless excluded)
          if (!shouldExclude) {
            scrollToPosition(scrollX, scrollY, behavior);
          }
        }

        // Reset navigation direction after handling
        setNavigationDirection('new');
      });

      // Store unsubscribe for cleanup
      (router as any)[SCROLL_PLUGIN_UNSUBSCRIBE_KEY] = () => {
        beforeNavigateUnsubscribe();
        if (afterNavigateUnsubscribe) {
          afterNavigateUnsubscribe();
        }
      };
    },

    onDestroy() {
      if (routerRef) {
        const unsubscribe = (routerRef as any)[SCROLL_PLUGIN_UNSUBSCRIBE_KEY];
        if (unsubscribe) {
          unsubscribe();
        }
        // Clean up scroll positions storage
        setScrollPositions(routerRef, new ScrollPositionCache(maxScrollPositions));
        // Clean up navigation direction state
        delete (routerRef as any)[SCROLL_NAVIGATION_DIRECTION_KEY];
        routerRef = undefined;
        afterNavigateUnsubscribe = null;
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
 * Get the current size of the scroll positions cache.
 *
 * @example
 * ```typescript
 * import { getScrollPositionCount } from '@oxog/routely-plugin-scroll';
 *
 * const count = getScrollPositionCount(router);
 * console.log(`Cached ${count} scroll positions`);
 * ```
 */
export function getScrollPositionCount(router: Router): number {
  const positions = getScrollPositions(router);
  return positions.size;
}

/**
 * Clear all cached scroll positions.
 *
 * @example
 * ```typescript
 * import { clearScrollPositions } from '@oxog/routely-plugin-scroll';
 *
 * clearScrollPositions(router);
 * ```
 */
export function clearScrollPositions(router: Router): void {
  const positions = getScrollPositions(router);
  positions.clear();
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
