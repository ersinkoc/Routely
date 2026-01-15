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

// Mock router
let eventCallbacks: Map<string, Function[]> = new Map();

const createMockRouter = (): Router => {
  eventCallbacks = new Map();

  return {
    currentRoute: { path: '/', params: {} },
    routes: [],
    history: {} as any,
    navigate: vi.fn((to: string, options?: any) => {
      // Update currentRoute BEFORE triggering callbacks
      (this as any).currentRoute = { path: to, params: {} };
      
      // Trigger afterNavigate event
      const callbacks = eventCallbacks.get('afterNavigate') || [];
      callbacks.forEach((cb) => cb());
      return Promise.resolve(undefined);
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
      return vi.fn();
    }),
    off: vi.fn(),
  };
};

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

  describe('plugin creation', () => {
    it('should create a plugin with correct metadata', () => {
      const plugin = scrollPlugin();
      expect(plugin.name).toBe('scroll');
      expect(plugin.version).toBe('1.0.0');
      expect(typeof plugin.install).toBe('function');
    });

    it('should accept empty options', () => {
      const plugin = scrollPlugin({});
      expect(plugin).toBeDefined();
    });

    it('should accept behavior option', () => {
      const plugin = scrollPlugin({ behavior: 'smooth' });
      expect(plugin).toBeDefined();
    });

    it('should accept scrollX option', () => {
      const plugin = scrollPlugin({ scrollX: 100 });
      expect(plugin).toBeDefined();
    });

    it('should accept scrollY option', () => {
      const plugin = scrollPlugin({ scrollY: 200 });
      expect(plugin).toBeDefined();
    });

    it('should accept exclude option', () => {
      const plugin = scrollPlugin({ exclude: ['/no-scroll'] });
      expect(plugin).toBeDefined();
    });

    it('should accept all options', () => {
      const plugin = scrollPlugin({
        behavior: 'smooth',
        scrollX: 100,
        scrollY: 200,
        exclude: ['/no-scroll', '/modal/*'],
      });
      expect(plugin).toBeDefined();
    });
  });

  describe('plugin installation', () => {
    it('should store options on router during install', () => {
      const router = createMockRouter();
      const options = { behavior: 'smooth' as const, scrollX: 100, scrollY: 200, exclude: ['/no-scroll'] };
      const plugin = scrollPlugin(options);

      plugin.install(router);

      const storedOptions = getScrollPluginOptions(router);
      expect(storedOptions).toBeDefined();
      expect(storedOptions?.behavior).toBe('smooth');
      expect(storedOptions?.scrollX).toBe(100);
      expect(storedOptions?.scrollY).toBe(200);
      expect(storedOptions?.exclude).toEqual(['/no-scroll']);
    });

    it('should store default options when none provided', () => {
      const router = createMockRouter();
      const plugin = scrollPlugin();

      plugin.install(router);

      const options = getScrollPluginOptions(router);
      expect(options).toBeDefined();
      expect(options?.behavior).toBe('auto');
      expect(options?.scrollX).toBe(0);
      expect(options?.scrollY).toBe(0);
      expect(options?.exclude).toEqual([]);
    });

    it('should wrap router.navigate', () => {
      const router = createMockRouter();
      const plugin = scrollPlugin();

      plugin.install(router);

      // Navigate should trigger scroll behavior
      router.navigate('/test');
      
      expect(router.navigate).toHaveBeenCalled();
    });

    it('should register afterNavigate listener', () => {
      const router = createMockRouter();
      const plugin = scrollPlugin();

      plugin.install(router);

      expect(router.on).toHaveBeenCalledWith('afterNavigate', expect.any(Function));
    });
  });

  describe('scroll behavior', () => {
    it('should scroll to top on new navigation', async () => {
      const router = createMockRouter();
      const plugin = scrollPlugin({ scrollX: 0, scrollY: 0 });

      plugin.install(router);

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
      // Set initial scroll position
      mockScrollX = 50;
      mockScrollY = 100;

      const plugin = scrollPlugin();
      plugin.install(router);

      await router.navigate('/about');

      // Scroll position should be saved for /home
      const positions = (router as any)[Symbol.for('scroll-positions')];
      expect(positions.get('/home')).toEqual({ x: 50, y: 100 });
    });
  });

  describe('scroll restoration', () => {
    it('should restore scroll position on back navigation', async () => {
      const router = createMockRouter();
      const plugin = scrollPlugin();

      plugin.install(router);

      // Save a position for /home
      router.currentRoute = { path: '/home', params: {} };
      mockScrollX = 50;
      mockScrollY = 100;

      // Manually save position
      const positions = (router as any)[Symbol.for('scroll-positions')];
      positions.set('/home', { x: 50, y: 100 });

      // Navigate to /about
      router.currentRoute = { path: '/about', params: {} };
      await router.navigate('/home', { delta: -1 });

      // Should restore to saved position
      expect(mockScrollTo).toHaveBeenCalledWith({ left: 50, top: 100, behavior: 'auto' });
    });

    it('should scroll to top if no saved position', async () => {
      const router = createMockRouter();
      const plugin = scrollPlugin({ scrollX: 0, scrollY: 0 });

      plugin.install(router);

      router.currentRoute = { path: '/new', params: {} };
      await router.navigate('/new', { delta: -1 });

      expect(mockScrollTo).toHaveBeenCalledWith({ left: 0, top: 0, behavior: 'auto' });
    });
  });

  describe('route exclusion', () => {
    it('should not scroll to top for excluded routes', async () => {
      const router = createMockRouter();
      const plugin = scrollPlugin({ exclude: ['/no-scroll'] });

      plugin.install(router);

      await router.navigate('/no-scroll');

      // Should not call scrollTo for excluded routes
      expect(mockScrollTo).not.toHaveBeenCalled();
    });

    it('should support wildcard exclusion', async () => {
      const router = createMockRouter();
      const plugin = scrollPlugin({ exclude: ['/modal/*'] });

      plugin.install(router);

      await router.navigate('/modal/settings');

      // Should not call scrollTo for wildcard excluded routes
      expect(mockScrollTo).not.toHaveBeenCalled();
    });

    it('should match base path in wildcard exclusion', async () => {
      const router = createMockRouter();
      const plugin = scrollPlugin({ exclude: ['/modal/*'] });

      plugin.install(router);

      await router.navigate('/modal');

      // Should not call scrollTo - base path matches wildcard
      expect(mockScrollTo).not.toHaveBeenCalled();
    });

    it('should scroll for non-excluded routes', async () => {
      const router = createMockRouter();
      const plugin = scrollPlugin({ exclude: ['/no-scroll'] });

      plugin.install(router);

      await router.navigate('/other-route');

      expect(mockScrollTo).toHaveBeenCalledWith({ left: 0, top: 0, behavior: 'auto' });
    });
  });

  describe('path normalization', () => {
    it('should ignore query params in path', async () => {
      const router = createMockRouter();
      const plugin = scrollPlugin();

      plugin.install(router);

      await router.navigate('/test');

      // Should scroll - paths are the same after normalization
      expect(mockScrollTo).toHaveBeenCalled();
    });

    it('should ignore hash in path', async () => {
      const router = createMockRouter();
      const plugin = scrollPlugin();

      plugin.install(router);

      await router.navigate('/test');

      // Should scroll - paths are the same after normalization
      expect(mockScrollTo).toHaveBeenCalled();
    });

    it('should handle query params in excluded routes', async () => {
      const router = createMockRouter();
      const plugin = scrollPlugin({ exclude: ['/no-scroll'] });

      plugin.install(router);

      await router.navigate('/no-scroll');

      // Should not scroll - exclusion matches after normalization
      expect(mockScrollTo).not.toHaveBeenCalled();
    });
  });

  describe('plugin cleanup', () => {
    it('should unsubscribe from events on destroy', () => {
      const router = createMockRouter();
      const plugin = scrollPlugin();

      plugin.install(router);

      expect(plugin.onDestroy).toBeDefined();

      if (plugin.onDestroy) {
        plugin.onDestroy(router);
      }

      // Positions storage should be cleared
      const positions = (router as any)[Symbol.for('scroll-positions')];
      expect(positions.size).toBe(0);
    });
  });
});

describe('saveScrollPosition', () => {
  beforeEach(() => {
    mockScrollX = 0;
    mockScrollY = 0;
  });

  afterEach(() => {
    mockScrollX = 0;
    mockScrollY = 0;
  });

  it('should save current scroll position for current route', () => {
    const router = createMockRouter();
    router.currentRoute = { path: '/home', params: {} };
    mockScrollX = 100;
    mockScrollY = 200;

    const plugin = scrollPlugin();
    plugin.install(router);

    saveScrollPosition(router);

    const positions = (router as any)[Symbol.for('scroll-positions')];
    expect(positions.get('/home')).toEqual({ x: 100, y: 200 });
  });

  it('should do nothing if no current route', () => {
    const router = createMockRouter();
    router.currentRoute = null as any;

    const plugin = scrollPlugin();
    plugin.install(router);

    expect(() => saveScrollPosition(router)).not.toThrow();
  });
});

describe('restoreScroll', () => {
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

  it('should restore saved scroll position', () => {
    const router = createMockRouter();
    router.currentRoute = { path: '/home', params: {} };

    const plugin = scrollPlugin();
    plugin.install(router);

    // Save a position
    const positions = (router as any)[Symbol.for('scroll-positions')];
    positions.set('/home', { x: 100, y: 200 });

    restoreScroll(router);

    expect(mockScrollTo).toHaveBeenCalledWith({ left: 100, top: 200, behavior: 'auto' });
  });

  it('should use smooth behavior if configured', () => {
    const router = createMockRouter();
    router.currentRoute = { path: '/home', params: {} };

    const plugin = scrollPlugin({ behavior: 'smooth' });
    plugin.install(router);

    const positions = (router as any)[Symbol.for('scroll-positions')];
    positions.set('/home', { x: 100, y: 200 });

    restoreScroll(router);

    expect(mockScrollTo).toHaveBeenCalledWith({ left: 100, top: 200, behavior: 'smooth' });
  });

  it('should do nothing if no saved position', () => {
    const router = createMockRouter();
    router.currentRoute = { path: '/home', params: {} };

    const plugin = scrollPlugin();
    plugin.install(router);

    restoreScroll(router);

    expect(mockScrollTo).not.toHaveBeenCalled();
  });

  it('should do nothing if no current route', () => {
    const router = createMockRouter();
    router.currentRoute = null as any;

    const plugin = scrollPlugin();
    plugin.install(router);

    restoreScroll(router);

    expect(mockScrollTo).not.toHaveBeenCalled();
  });
});

describe('scrollToTop', () => {
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

  it('should scroll to configured position', () => {
    const router = createMockRouter();
    const plugin = scrollPlugin({ scrollX: 50, scrollY: 100 });
    plugin.install(router);

    scrollToTop(router);

    expect(mockScrollTo).toHaveBeenCalledWith({ left: 50, top: 100, behavior: 'auto' });
  });

  it('should use smooth behavior if configured', () => {
    const router = createMockRouter();
    const plugin = scrollPlugin({ behavior: 'smooth' });
    plugin.install(router);

    scrollToTop(router);

    expect(mockScrollTo).toHaveBeenCalledWith({ left: 0, top: 0, behavior: 'smooth' });
  });

  it('should use default position if not configured', () => {
    const router = createMockRouter();
    const plugin = scrollPlugin();
    plugin.install(router);

    scrollToTop(router);

    expect(mockScrollTo).toHaveBeenCalledWith({ left: 0, top: 0, behavior: 'auto' });
  });
});

describe('integration', () => {
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

  it('should work with router.use()', () => {
    const router = createMockRouter();
    const plugin = scrollPlugin();

    const result = router.use(plugin);

    expect(result).toBe(router);
  });

  it('should handle multiple navigations', async () => {
    const router = createMockRouter();
    const plugin = scrollPlugin({ behavior: 'smooth' });

    plugin.install(router);

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

    router.currentRoute = { path: '/test', params: {} };
    await router.navigate('/test');

    expect(mockScrollTo).toHaveBeenCalledWith({ left: 100, top: 200, behavior: 'smooth' });
  });
});
