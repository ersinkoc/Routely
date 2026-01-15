/**
 * Tests for guards plugin
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Router } from '@oxog/routely-core';
import {
  guardsPlugin,
  getGuardsPluginOptions,
  hasGuardsForPath,
  type Guard,
  type GuardConfig,
  type GuardResult,
  type GuardEntry,
} from '../src/index';

// Track navigation calls for testing
let navigationCalls: Array<{ to: string; options?: any }> = [];

// Mock router factory
const createMockRouter = (): Router => {
  navigationCalls = [];
  const navigate = vi.fn((to: string, options?: any) => {
    navigationCalls.push({ to, options });
    return Promise.resolve(undefined);
  });

  return {
    currentRoute: null,
    routes: [],
    history: {} as any,
    navigate,
    back: vi.fn(),
    forward: vi.fn(),
    go: vi.fn(),
    use: vi.fn(function (this: Router, plugin: any) {
      plugin.install(this);
      return this;
    }),
    unregister: vi.fn(),
    list: vi.fn(() => []),
    on: vi.fn(() => vi.fn()),
    off: vi.fn(),
  };
};

describe('guardsPlugin', () => {
  describe('plugin creation', () => {
    it('should create a plugin with correct metadata', () => {
      const plugin = guardsPlugin({
        guards: {},
      });
      expect(plugin.name).toBe('guards');
      expect(plugin.version).toBe('1.0.0');
      expect(typeof plugin.install).toBe('function');
    });

    it('should accept empty guards object', () => {
      const plugin = guardsPlugin({ guards: {} });
      expect(plugin).toBeDefined();
    });

    it('should accept guards with sync functions', () => {
      const guard: Guard = () => true;
      const plugin = guardsPlugin({
        guards: { '/admin': guard },
      });
      expect(plugin).toBeDefined();
    });

    it('should accept guards with async functions', () => {
      const guard: Guard = async () => true;
      const plugin = guardsPlugin({
        guards: { '/admin': guard },
      });
      expect(plugin).toBeDefined();
    });

    it('should accept guards with config objects', () => {
      const guardConfig: GuardConfig = {
        guard: () => true,
        redirect: '/login',
      };
      const plugin = guardsPlugin({
        guards: { '/admin': guardConfig },
      });
      expect(plugin).toBeDefined();
    });

    it('should accept defaultRedirect option', () => {
      const plugin = guardsPlugin({
        guards: {},
        defaultRedirect: '/login',
      });
      expect(plugin).toBeDefined();
    });

    it('should accept multiple guards', () => {
      const plugin = guardsPlugin({
        guards: {
          '/admin': () => true,
          '/profile': { guard: () => false, redirect: '/login' },
          '/settings/*': async () => true,
        },
        defaultRedirect: '/login',
      });
      expect(plugin).toBeDefined();
    });
  });

  describe('plugin installation', () => {
    it('should store options on router during install', () => {
      const router = createMockRouter();
      const guard = () => true;
      const plugin = guardsPlugin({
        guards: { '/admin': guard },
        defaultRedirect: '/login',
      });

      plugin.install(router);

      const options = getGuardsPluginOptions(router);
      expect(options).toBeDefined();
      expect(options?.defaultRedirect).toBe('/login');
      expect(options?.compiledGuards).toHaveLength(1);
    });

    it('should wrap navigate function', () => {
      const router = createMockRouter();
      const originalNavigate = router.navigate;
      const plugin = guardsPlugin({
        guards: {},
      });

      plugin.install(router);

      expect(router.navigate).not.toBe(originalNavigate);
    });
  });

  describe('guard execution', () => {
    it('should allow navigation when guard returns true', async () => {
      const router = createMockRouter();
      const plugin = guardsPlugin({
        guards: {
          '/admin': () => true,
        },
      });

      plugin.install(router);

      await router.navigate('/admin');

      expect(navigationCalls).toHaveLength(1);
      expect(navigationCalls[0].to).toBe('/admin');
    });

    it('should block navigation when guard returns false', async () => {
      const router = createMockRouter();
      const plugin = guardsPlugin({
        guards: {
          '/admin': () => false,
        },
        defaultRedirect: '/login',
      });

      plugin.install(router);

      await router.navigate('/admin');

      // Should redirect to default redirect
      expect(navigationCalls).toHaveLength(1);
      expect(navigationCalls[0].to).toBe('/login');
    });

    it('should redirect to guard-specific redirect', async () => {
      const router = createMockRouter();
      const plugin = guardsPlugin({
        guards: {
          '/admin': { guard: () => false, redirect: '/unauthorized' },
        },
      });

      plugin.install(router);

      await router.navigate('/admin');

      expect(navigationCalls).toHaveLength(1);
      expect(navigationCalls[0].to).toBe('/unauthorized');
    });

    it('should handle async guards that resolve to true', async () => {
      const router = createMockRouter();
      const plugin = guardsPlugin({
        guards: {
          '/profile': async () => {
            return true;
          },
        },
      });

      plugin.install(router);

      await router.navigate('/profile');

      expect(navigationCalls).toHaveLength(1);
      expect(navigationCalls[0].to).toBe('/profile');
    });

    it('should handle async guards that resolve to false', async () => {
      const router = createMockRouter();
      const plugin = guardsPlugin({
        guards: {
          '/profile': async () => false,
        },
        defaultRedirect: '/login',
      });

      plugin.install(router);

      await router.navigate('/profile');

      expect(navigationCalls).toHaveLength(1);
      expect(navigationCalls[0].to).toBe('/login');
    });

    it('should handle guard result object with allowed: true', async () => {
      const router = createMockRouter();
      const plugin = guardsPlugin({
        guards: {
          '/admin': () => ({ allowed: true }),
        },
      });

      plugin.install(router);

      await router.navigate('/admin');

      expect(navigationCalls).toHaveLength(1);
      expect(navigationCalls[0].to).toBe('/admin');
    });

    it('should handle guard result object with allowed: false and redirect', async () => {
      const router = createMockRouter();
      const plugin = guardsPlugin({
        guards: {
          '/admin': () => ({ allowed: false, redirect: '/custom-redirect' }),
        },
      });

      plugin.install(router);

      await router.navigate('/admin');

      expect(navigationCalls).toHaveLength(1);
      expect(navigationCalls[0].to).toBe('/custom-redirect');
    });
  });

  describe('pattern matching', () => {
    it('should match exact paths', async () => {
      const router = createMockRouter();
      const guard = vi.fn(() => true);
      const plugin = guardsPlugin({
        guards: {
          '/admin': guard,
        },
      });

      plugin.install(router);

      await router.navigate('/admin');

      expect(guard).toHaveBeenCalled();
    });

    it('should not match different paths', async () => {
      const router = createMockRouter();
      const guard = vi.fn(() => true);
      const plugin = guardsPlugin({
        guards: {
          '/admin': guard,
        },
      });

      plugin.install(router);

      await router.navigate('/profile');

      expect(guard).not.toHaveBeenCalled();
    });

    it('should match wildcard patterns', async () => {
      const router = createMockRouter();
      const guard = vi.fn(() => true);
      const plugin = guardsPlugin({
        guards: {
          '/admin/*': guard,
        },
      });

      plugin.install(router);

      await router.navigate('/admin/users');

      expect(guard).toHaveBeenCalled();
    });

    it('should match wildcard with base path', async () => {
      const router = createMockRouter();
      const guard = vi.fn(() => true);
      const plugin = guardsPlugin({
        guards: {
          '/admin/*': guard,
        },
      });

      plugin.install(router);

      await router.navigate('/admin');

      expect(guard).toHaveBeenCalled();
    });

    it('should match parameterized paths', async () => {
      const router = createMockRouter();
      const guard = vi.fn(() => true);
      const plugin = guardsPlugin({
        guards: {
          '/users/:id': guard,
        },
      });

      plugin.install(router);

      await router.navigate('/users/123');

      expect(guard).toHaveBeenCalled();
    });

    it('should match multiple patterns for same path', async () => {
      const router = createMockRouter();
      const guard1 = vi.fn(() => true);
      const guard2 = vi.fn(() => true);
      const plugin = guardsPlugin({
        guards: {
          '/admin': guard1,
          '/admin/*': guard2,
        },
      });

      plugin.install(router);

      await router.navigate('/admin');

      expect(guard1).toHaveBeenCalled();
      expect(guard2).toHaveBeenCalled();
    });
  });

  describe('multiple guards', () => {
    it('should execute all matching guards', async () => {
      const router = createMockRouter();
      const guard1 = vi.fn(() => true);
      const guard2 = vi.fn(() => true);
      const plugin = guardsPlugin({
        guards: {
          '/admin/*': guard1,
          '/admin/users': guard2,
        },
      });

      plugin.install(router);

      await router.navigate('/admin/users');

      expect(guard1).toHaveBeenCalled();
      expect(guard2).toHaveBeenCalled();
    });

    it('should stop at first failing guard', async () => {
      const router = createMockRouter();
      const guard1 = vi.fn(() => true);
      const guard2 = vi.fn(() => false);
      const guard3 = vi.fn(() => true);
      const plugin = guardsPlugin({
        guards: {
          '/admin/*': guard1,
          '/admin/users/*': guard2,
          '/admin/users': guard3,
        },
        defaultRedirect: '/login',
      });

      plugin.install(router);

      await router.navigate('/admin/users');

      expect(guard1).toHaveBeenCalled();
      expect(guard2).toHaveBeenCalled();
      expect(guard3).not.toHaveBeenCalled();
    });

    it('should redirect on first guard failure', async () => {
      const router = createMockRouter();
      const plugin = guardsPlugin({
        guards: {
          '/admin/*': () => false,
          '/admin/users': () => true,
        },
        defaultRedirect: '/login',
      });

      plugin.install(router);

      await router.navigate('/admin/users');

      expect(navigationCalls).toHaveLength(1);
      expect(navigationCalls[0].to).toBe('/login');
    });
  });

  describe('hasGuardsForPath', () => {
    it('should return true when guards exist for path', () => {
      const router = createMockRouter();
      const plugin = guardsPlugin({
        guards: {
          '/admin': () => true,
        },
      });

      plugin.install(router);

      expect(hasGuardsForPath(router, '/admin')).toBe(true);
    });

    it('should return false when no guards exist for path', () => {
      const router = createMockRouter();
      const plugin = guardsPlugin({
        guards: {
          '/admin': () => true,
        },
      });

      plugin.install(router);

      expect(hasGuardsForPath(router, '/profile')).toBe(false);
    });

    it('should return true when wildcard guard matches', () => {
      const router = createMockRouter();
      const plugin = guardsPlugin({
        guards: {
          '/admin/*': () => true,
        },
      });

      plugin.install(router);

      expect(hasGuardsForPath(router, '/admin/users')).toBe(true);
    });

    it('should return false for router without plugin', () => {
      const router = createMockRouter();

      expect(hasGuardsForPath(router, '/admin')).toBe(false);
    });
  });

  describe('navigation options', () => {
    it('should pass navigation options to redirected navigate', async () => {
      const router = createMockRouter();
      const plugin = guardsPlugin({
        guards: {
          '/admin': () => false,
        },
        defaultRedirect: '/login',
      });

      plugin.install(router);

      const options = { replace: true };
      await router.navigate('/admin', options);

      expect(navigationCalls).toHaveLength(1);
      expect(navigationCalls[0].to).toBe('/login');
      expect(navigationCalls[0].options).toEqual(options);
    });

    it('should pass navigation options to successful navigate', async () => {
      const router = createMockRouter();
      const plugin = guardsPlugin({
        guards: {
          '/admin': () => true,
        },
      });

      plugin.install(router);

      const options = { replace: true };
      await router.navigate('/admin', options);

      expect(navigationCalls).toHaveLength(1);
      expect(navigationCalls[0].to).toBe('/admin');
      expect(navigationCalls[0].options).toEqual(options);
    });
  });

  describe('guard result normalization', () => {
    it('should normalize boolean true to { allowed: true }', async () => {
      const router = createMockRouter();
      const plugin = guardsPlugin({
        guards: {
          '/admin': () => true,
        },
      });

      plugin.install(router);

      await router.navigate('/admin');

      expect(navigationCalls).toHaveLength(1);
      expect(navigationCalls[0].to).toBe('/admin');
    });

    it('should normalize boolean false to { allowed: false }', async () => {
      const router = createMockRouter();
      const plugin = guardsPlugin({
        guards: {
          '/admin': () => false,
        },
        defaultRedirect: '/login',
      });

      plugin.install(router);

      await router.navigate('/admin');

      expect(navigationCalls).toHaveLength(1);
      expect(navigationCalls[0].to).toBe('/login');
    });
  });

  describe('redirect priority', () => {
    it('should use result redirect over config redirect', async () => {
      const router = createMockRouter();
      const plugin = guardsPlugin({
        guards: {
          '/admin': {
            guard: () => ({ allowed: false, redirect: '/result-redirect' }),
            redirect: '/config-redirect',
          },
        },
      });

      plugin.install(router);

      await router.navigate('/admin');

      expect(navigationCalls).toHaveLength(1);
      expect(navigationCalls[0].to).toBe('/result-redirect');
    });

    it('should use config redirect when result has no redirect', async () => {
      const router = createMockRouter();
      const plugin = guardsPlugin({
        guards: {
          '/admin': {
            guard: () => false,
            redirect: '/config-redirect',
          },
        },
      });

      plugin.install(router);

      await router.navigate('/admin');

      expect(navigationCalls).toHaveLength(1);
      expect(navigationCalls[0].to).toBe('/config-redirect');
    });

    it('should use default redirect when no other redirect specified', async () => {
      const router = createMockRouter();
      const plugin = guardsPlugin({
        guards: {
          '/admin': () => false,
        },
        defaultRedirect: '/default-redirect',
      });

      plugin.install(router);

      await router.navigate('/admin');

      expect(navigationCalls).toHaveLength(1);
      expect(navigationCalls[0].to).toBe('/default-redirect');
    });

    it('should use default redirect "/" when no redirect specified', async () => {
      const router = createMockRouter();
      const plugin = guardsPlugin({
        guards: {
          '/admin': () => false,
        },
      });

      plugin.install(router);

      await router.navigate('/admin');

      // When redirecting to '/', only the redirect navigation is tracked
      // because the original navigate to '/admin' is intercepted by the guard
      expect(navigationCalls).toHaveLength(1);
      expect(navigationCalls[0].to).toBe('/');
    });
  });
});
