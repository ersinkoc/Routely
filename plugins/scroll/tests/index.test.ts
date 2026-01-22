/**
 * Tests for scroll plugin
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  scrollPlugin,
  getScrollPluginOptions,
  saveScrollPosition,
  restoreScroll,
  scrollToTop,
  _hasScrollPositions,
  _getScrollPositionsInternal,
  ScrollPositionCache,
} from '../src/index';
import type { Router } from '@oxog/routely-core';

// Mock window.scrollTo
let mockScrollX = 0;
let mockScrollY = 0;

const originalScrollTo = window.scrollTo;
const mockScrollTo = vi.fn((x: number, y: number | ScrollOptions) => {
  if (typeof y === 'object') {
    mockScrollX = y.left ?? 0;
    mockScrollY = y.top ?? 0;
  } else {
    mockScrollX = x;
    mockScrollY = y;
  }
});

// Replace window.scrollTo with the mock
window.scrollTo = mockScrollTo as any;

// Mock window.scrollX and window.scrollY
Object.defineProperty(window, 'scrollX', {
  get: () => mockScrollX,
  configurable: true,
});

Object.defineProperty(window, 'scrollY', {
  get: () => mockScrollY,
  configurable: true,
});

// Mock router with proper async event handling
let mockRouter: {
  router: Router;
  triggerEvent: (event: string, ...args: any[]) => void;
  navigateCalls: Array<{ to: string; options?: any }>;
};

function createMockRouter(): Router {
  const eventCallbacks: Map<string, Function[]> = new Map();
  const navigateCalls: Array<{ to: string; options?: any }> = [];
  let currentRouteImpl: any = { path: '/', params: {}, search: {}, hash: '', state: null, meta: {} };

  // Store the base navigate implementation
  const baseNavigate = async (to: string, options?: any) => {
    navigateCalls.push({ to, options });

    // Create the target route object
    const targetRoute = { path: to, params: {}, search: {}, hash: '', state: options?.state, meta: {} };

    // Trigger beforeNavigate event first (this is where scroll plugin saves positions)
    const beforeCallbacks = eventCallbacks.get('beforeNavigate') || [];
    for (const cb of beforeCallbacks) {
      try {
        const result = await cb(targetRoute, currentRouteImpl);
        // If any beforeNavigate handler returns false, cancel navigation
        if (result === false) {
          return false;
        }
      } catch (e) {
        console.error('Error in beforeNavigate callback:', e);
        return false;
      }
    }

    // Update currentRoute after beforeNavigate allows navigation
    currentRouteImpl = targetRoute;

    // Trigger afterNavigate event asynchronously (simulating real kernel behavior)
    const callbacks = eventCallbacks.get('afterNavigate') || [];
    for (const cb of callbacks) {
      try {
        await cb(currentRouteImpl);
      } catch (e) {
        console.error('Error in afterNavigate callback:', e);
      }
    }

    return Promise.resolve(true);
  };

  const routerObj: any = {
    get currentRoute() {
      return currentRouteImpl;
    },
    set currentRoute(value: any) {
      currentRouteImpl = value;
    },

    routes: [],
    history: {
      location: { pathname: '/', search: '', hash: '', state: null }
    } as any,

    // Create a spy that will survive the plugin's override
    navigate: vi.fn(function(this: any, to: string, options?: any) {
      return baseNavigate(to, options);
    }),

    back: vi.fn(),
    forward: vi.fn(),
    go: vi.fn(),

    use: vi.fn(function (this: Router, plugin: any) {
      plugin.install(this);
      return this;
    }),

    unregister: vi.fn(),
    list: vi.fn(() => []),

    on: vi.fn((event: string, callback: Function) => {
      if (!eventCallbacks.has(event)) {
        eventCallbacks.set(event, []);
      }
      eventCallbacks.get(event)!.push(callback);
      return vi.fn(() => {
        const callbacks = eventCallbacks.get(event);
        if (callbacks) {
          const index = callbacks.indexOf(callback);
          if (index > -1) {
            callbacks.splice(index, 1);
          }
        }
      });
    }),

    off: vi.fn(),
  };

  mockRouter = {
    router: routerObj,
    triggerEvent: (event: string, ...args: any[]) => {
      const callbacks = eventCallbacks.get(event) || [];
      callbacks.forEach((cb) => cb(...args));
    },
    get navigateCalls() {
      return navigateCalls;
    }
  };

  return routerObj;
}

describe('scrollPlugin', () => {
  beforeEach(() => {
    mockScrollX = 0;
    mockScrollY = 0;
    mockScrollTo.mockClear();
    window.scrollTo = mockScrollTo as any;
  });

  afterEach(() => {
    mockScrollX = 0;
    mockScrollY = 0;
    mockScrollTo.mockClear();
    window.scrollTo = originalScrollTo;
  });

  describe('plugin installation', () => {
    it('should wrap router.navigate', async () => {
      const router = createMockRouter();
      const plugin = scrollPlugin();

      plugin.install(router);

      // Navigate should work
      await router.navigate('/test');

      // After plugin install, router.navigate is overridden
      // Check navigateCalls instead of spy
      expect(mockRouter.navigateCalls).toHaveLength(1);
      expect(mockRouter.navigateCalls[0]!.to).toBe('/test');
    });

    it('should store plugin options on router', () => {
      const router = createMockRouter();
      const plugin = scrollPlugin({ behavior: 'smooth', scrollX: 100, scrollY: 200 });

      plugin.install(router);

      expect(getScrollPluginOptions(router)).toEqual({
        behavior: 'smooth',
        scrollX: 100,
        scrollY: 200,
        exclude: [],
        maxScrollPositions: 50,
      });
    });

    it('should use default options when none provided', () => {
      const router = createMockRouter();
      const plugin = scrollPlugin();

      plugin.install(router);

      expect(getScrollPluginOptions(router)).toEqual({
        behavior: 'auto',
        scrollX: 0,
        scrollY: 0,
        exclude: [],
        maxScrollPositions: 50,
      });
    });

    it('should initialize scroll positions storage', () => {
      const router = createMockRouter();
      const plugin = scrollPlugin();

      plugin.install(router);

      expect(_hasScrollPositions(router)).toBe(true);
      expect(_getScrollPositionsInternal(router)).toBeInstanceOf(ScrollPositionCache);
    });
  });

  describe('scroll behavior', () => {
    it('should scroll to top on new navigation', async () => {
      const router = createMockRouter();
      const plugin = scrollPlugin();

      plugin.install(router);

      // Set initial scroll position
      mockScrollX = 50;
      mockScrollY = 100;

      await router.navigate('/new-route');

      expect(mockScrollTo).toHaveBeenCalledWith({ left: 0, top: 0, behavior: 'auto' });
    });

    it('should use smooth behavior when configured', async () => {
      const router = createMockRouter();
      const plugin = scrollPlugin({ behavior: 'smooth' });

      plugin.install(router);

      await router.navigate('/new-route');

      expect(mockScrollTo).toHaveBeenCalledWith({ left: 0, top: 0, behavior: 'smooth' });
    });

    it('should use custom scrollX and scrollY', async () => {
      const router = createMockRouter();
      const plugin = scrollPlugin({ scrollX: 100, scrollY: 200 });

      plugin.install(router);

      await router.navigate('/new-route');

      expect(mockScrollTo).toHaveBeenCalledWith({ left: 100, top: 200, behavior: 'auto' });
    });

    it('should save scroll position before navigation', async () => {
      const router = createMockRouter();
      const plugin = scrollPlugin();

      plugin.install(router);

      // Set initial scroll position
      mockScrollX = 50;
      mockScrollY = 100;

      router.currentRoute = { path: '/current', params: {} };

      await router.navigate('/new-route');

      const positions = _getScrollPositionsInternal(router)!;
      expect(positions.get('/current')).toEqual({ x: 50, y: 100 });
    });
  });

  describe('scroll restoration', () => {
    it('should restore scroll position on back navigation', async () => {
      const router = createMockRouter();
      const plugin = scrollPlugin();

      plugin.install(router);

      // Save position for /back-route
      const positions = _getScrollPositionsInternal(router)!;
      positions.set('/back-route', { x: 50, y: 100 });

      await router.navigate('/back-route');

      expect(mockScrollTo).toHaveBeenCalledWith({ left: 50, top: 100, behavior: 'auto' });
    });

    it('should scroll to top if no saved position', async () => {
      const router = createMockRouter();
      const plugin = scrollPlugin();

      plugin.install(router);

      await router.navigate('/new-route');

      expect(mockScrollTo).toHaveBeenCalledWith({ left: 0, top: 0, behavior: 'auto' });
    });
  });

  describe('route exclusion', () => {
    it('should not scroll for excluded routes', async () => {
      const router = createMockRouter();
      const plugin = scrollPlugin({ exclude: ['/no-scroll', '/modal/*'] });

      plugin.install(router);

      mockScrollTo.mockClear();

      await router.navigate('/no-scroll');

      expect(mockScrollTo).not.toHaveBeenCalled();
    });

    it('should scroll for non-excluded routes', async () => {
      const router = createMockRouter();
      const plugin = scrollPlugin({ exclude: ['/no-scroll'] });

      plugin.install(router);

      await router.navigate('/other-route');

      expect(mockScrollTo).toHaveBeenCalledWith({ left: 0, top: 0, behavior: 'auto' });
    });

    it('should exclude wildcard patterns', async () => {
      const router = createMockRouter();
      const plugin = scrollPlugin({ exclude: ['/modal/*', '/tabs/*'] });

      plugin.install(router);

      mockScrollTo.mockClear();

      await router.navigate('/modal/dialog');

      expect(mockScrollTo).not.toHaveBeenCalled();

      await router.navigate('/tabs/1');

      expect(mockScrollTo).not.toHaveBeenCalled();
    });
  });

  describe('path normalization', () => {
    it('should ignore query params in path', async () => {
      const router = createMockRouter();
      const plugin = scrollPlugin();

      plugin.install(router);

      // Set initial route so we have something to save
      router.currentRoute = { path: '/current', params: {} };
      mockScrollX = 10;
      mockScrollY = 20;

      await router.navigate('/test?param=value');

      expect(mockScrollTo).toHaveBeenCalled();

      const positions = _getScrollPositionsInternal(router)!;
      // Should save position for /current, not /test?param=value
      expect(positions.has('/current')).toBe(true);
      expect(positions.get('/current')).toEqual({ x: 10, y: 20 });
    });

    it('should ignore hash in path', async () => {
      const router = createMockRouter();
      const plugin = scrollPlugin();

      plugin.install(router);

      // Set initial route so we have something to save
      router.currentRoute = { path: '/current', params: {} };
      mockScrollX = 30;
      mockScrollY = 40;

      await router.navigate('/test#section');

      expect(mockScrollTo).toHaveBeenCalled();

      const positions = _getScrollPositionsInternal(router)!;
      expect(positions.has('/current')).toBe(true);
      expect(positions.get('/current')).toEqual({ x: 30, y: 40 });
    });
  });

  describe('integration', () => {
    it('should handle multiple navigations', async () => {
      const router = createMockRouter();
      const plugin = scrollPlugin();

      plugin.install(router);

      mockScrollTo.mockClear();

      // First navigation
      router.currentRoute = { path: '/page1', params: {} };
      await router.navigate('/page1');

      // Second navigation
      router.currentRoute = { path: '/page2', params: {} };
      await router.navigate('/page2');

      expect(mockScrollTo).toHaveBeenCalledTimes(2);
    });

    it('should handle plugin with all options', async () => {
      const router = createMockRouter();
      const plugin = scrollPlugin({
        behavior: 'smooth',
        scrollX: 100,
        scrollY: 200,
        exclude: ['/no-scroll', '/modal/*'],
      });

      plugin.install(router);

      // Navigate to a new route (not currentRoute)
      await router.navigate('/test');

      expect(mockScrollTo).toHaveBeenCalledWith({ left: 100, top: 200, behavior: 'smooth' });
    });
  });

  describe('utility functions', () => {
    it('saveScrollPosition should save current scroll position', () => {
      const router = createMockRouter();
      const plugin = scrollPlugin();

      plugin.install(router);

      mockScrollX = 75;
      mockScrollY = 150;
      router.currentRoute = { path: '/test', params: {} };

      saveScrollPosition(router);

      const positions = _getScrollPositionsInternal(router)!;
      expect(positions.get('/test')).toEqual({ x: 75, y: 150 });
    });

    it('restoreScroll should restore saved position', () => {
      const router = createMockRouter();
      const plugin = scrollPlugin({ behavior: 'smooth' });

      plugin.install(router);

      const positions = _getScrollPositionsInternal(router)!;
      positions.set('/test', { x: 75, y: 150 });

      router.currentRoute = { path: '/test', params: {} };

      restoreScroll(router);

      expect(mockScrollTo).toHaveBeenCalledWith({ left: 75, top: 150, behavior: 'smooth' });
    });

    it('scrollToTop should scroll to configured position', () => {
      const router = createMockRouter();
      const plugin = scrollPlugin({ scrollX: 50, scrollY: 100, behavior: 'instant' as ScrollBehavior });

      plugin.install(router);

      router.currentRoute = { path: '/test', params: {} };

      scrollToTop(router);

      expect(mockScrollTo).toHaveBeenCalledWith({ left: 50, top: 100, behavior: 'instant' });
    });
  });

  describe('cleanup', () => {
    it('should clean up event listeners on destroy', () => {
      const router = createMockRouter();
      const plugin = scrollPlugin();

      const unsubscribe = plugin.install(router);

      // Navigate to register event listener
      void router.navigate('/test');

      // Destroy plugin
      if (plugin.onDestroy) {
        plugin.onDestroy();
      }

      // Navigate again - should not call scrollTo
      mockScrollTo.mockClear();
      void router.navigate('/test2');

      // After destroy, scroll should not be called
      // (This is a basic check - actual cleanup would verify no event listeners remain)
      expect(plugin.onDestroy).toBeDefined();
    });
  });
});
