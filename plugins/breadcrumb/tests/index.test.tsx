/**
 * Tests for breadcrumb plugin
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import {
  breadcrumbPlugin,
  useBreadcrumbs,
  getBreadcrumbPluginOptions,
  generateBreadcrumbsForPath,
  BreadcrumbProvider,
  type BreadcrumbItem,
  type BreadcrumbPluginOptions,
  type Route,
} from '../src/index';
import type { Router } from '@oxog/routely-core';

// Mock router
const createMockRouter = (): Router => ({
  currentRoute: null,
  routes: [],
  history: {} as any,
  navigate: vi.fn(),
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
});

// Test component that uses useBreadcrumbs
function TestBreadcrumbsComponent() {
  const { breadcrumbs } = useBreadcrumbs();

  return React.createElement(
    'nav',
    { 'data-testid': 'breadcrumbs' },
    breadcrumbs.map((crumb: BreadcrumbItem, index: number) =>
      React.createElement(
        'span',
        { key: crumb.path, 'data-testid': `crumb-${index}` },
        `${crumb.label}:${crumb.path}`
      )
    )
  );
}

describe('breadcrumbPlugin', () => {
  describe('plugin creation', () => {
    it('should create a plugin with correct metadata', () => {
      const plugin = breadcrumbPlugin();
      expect(plugin.name).toBe('breadcrumb');
      expect(plugin.version).toBe('1.0.0');
      expect(typeof plugin.install).toBe('function');
    });

    it('should accept empty options', () => {
      const plugin = breadcrumbPlugin({});
      expect(plugin).toBeDefined();
    });

    it('should accept custom label function', () => {
      const label = vi.fn(() => 'Custom');
      const plugin = breadcrumbPlugin({ label });
      expect(plugin).toBeDefined();
    });

    it('should accept custom homeLabel', () => {
      const plugin = breadcrumbPlugin({ homeLabel: 'Start' });
      expect(plugin).toBeDefined();
    });

    it('should accept custom separator', () => {
      const plugin = breadcrumbPlugin({ separator: '→' });
      expect(plugin).toBeDefined();
    });

    it('should accept includeHome option', () => {
      const plugin = breadcrumbPlugin({ includeHome: false });
      expect(plugin).toBeDefined();
    });

    it('should accept all options', () => {
      const label = vi.fn(() => 'Custom');
      const plugin = breadcrumbPlugin({
        label,
        homeLabel: 'Start',
        separator: '→',
        includeHome: false,
      });
      expect(plugin).toBeDefined();
    });
  });

  describe('plugin installation', () => {
    it('should store options on router during install', () => {
      const router = createMockRouter();
      const label = vi.fn(() => 'Custom');
      const plugin = breadcrumbPlugin({
        label,
        homeLabel: 'Start',
        separator: '→',
        includeHome: false,
      });

      plugin.install(router);

      const options = getBreadcrumbPluginOptions(router);
      expect(options).toBeDefined();
      expect(options?.label).toBe(label);
      expect(options?.homeLabel).toBe('Start');
      expect(options?.separator).toBe('→');
      expect(options?.includeHome).toBe(false);
    });

    it('should store default options when none provided', () => {
      const router = createMockRouter();
      const plugin = breadcrumbPlugin();

      plugin.install(router);

      const options = getBreadcrumbPluginOptions(router);
      expect(options).toBeDefined();
      expect(typeof options?.label).toBe('function');
      expect(options?.homeLabel).toBe('Home');
      expect(options?.separator).toBe('/');
      expect(options?.includeHome).toBe(true);
    });

    it('should store BreadcrumbProvider on router', () => {
      const router = createMockRouter();
      const plugin = breadcrumbPlugin();

      plugin.install(router);

      const options = getBreadcrumbPluginOptions(router);
      expect(options?.BreadcrumbProvider).toBeDefined();
    });
  });

  describe('defaultLabel function', () => {
    it('should use meta.breadcrumb when available', () => {
      const router = createMockRouter();
      const plugin = breadcrumbPlugin();
      plugin.install(router);

      const options = getBreadcrumbPluginOptions(router);
      const route: Route = {
        path: '/users',
        params: {},
        meta: { breadcrumb: 'All Users' },
      };

      expect(options?.label(route, '/users')).toBe('All Users');
    });

    it('should use meta.title when breadcrumb not available', () => {
      const router = createMockRouter();
      const plugin = breadcrumbPlugin();
      plugin.install(router);

      const options = getBreadcrumbPluginOptions(router);
      const route: Route = {
        path: '/users',
        params: {},
        meta: { title: 'Users Page' },
      };

      expect(options?.label(route, '/users')).toBe('Users Page');
    });

    it('should use path segment when no meta available', () => {
      const router = createMockRouter();
      const plugin = breadcrumbPlugin();
      plugin.install(router);

      const options = getBreadcrumbPluginOptions(router);
      const route: Route = {
        path: '/users',
        params: {},
      };

      expect(options?.label(route, '/users')).toBe('users');
    });

    it('should return Home for root path', () => {
      const router = createMockRouter();
      const plugin = breadcrumbPlugin();
      plugin.install(router);

      const options = getBreadcrumbPluginOptions(router);
      const route: Route = {
        path: '/',
        params: {},
      };

      expect(options?.label(route, '/')).toBe('Home');
    });
  });

  describe('generateBreadcrumbs', () => {
    it('should generate breadcrumbs for simple path', () => {
      const router = createMockRouter();
      const plugin = breadcrumbPlugin();
      plugin.install(router);

      const routes: Route[] = [
        { path: '/', params: {} },
        { path: '/users', params: {}, meta: { breadcrumb: 'Users' } },
      ];

      const breadcrumbs = generateBreadcrumbsForPath(router, '/users', routes);

      expect(breadcrumbs).toHaveLength(2);
      expect(breadcrumbs[0]).toEqual({
        path: '/',
        label: 'Home',
        route: routes[0],
      });
      expect(breadcrumbs[1]).toEqual({
        path: '/users',
        label: 'Users',
        route: routes[1],
      });
    });

    it('should generate breadcrumbs for nested path', () => {
      const router = createMockRouter();
      const plugin = breadcrumbPlugin();
      plugin.install(router);

      const routes: Route[] = [
        { path: '/', params: {} },
        { path: '/admin', params: {}, meta: { breadcrumb: 'Admin' } },
        { path: '/admin/users', params: {}, meta: { breadcrumb: 'Users' } },
        { path: '/admin/users/123', params: {}, meta: { breadcrumb: 'User Details' } },
      ];

      const breadcrumbs = generateBreadcrumbsForPath(router, '/admin/users/123', routes);

      expect(breadcrumbs).toHaveLength(4);
      expect(breadcrumbs[0].label).toBe('Home');
      expect(breadcrumbs[1].label).toBe('Admin');
      expect(breadcrumbs[2].label).toBe('Users');
      expect(breadcrumbs[3].label).toBe('User Details');
    });

    it('should handle dynamic routes', () => {
      const router = createMockRouter();
      const plugin = breadcrumbPlugin();
      plugin.install(router);

      const routes: Route[] = [
        { path: '/', params: {} },
        { path: '/users', params: {}, meta: { breadcrumb: 'Users' } },
        { path: '/users/:id', params: {}, meta: { breadcrumb: 'User' } },
      ];

      const breadcrumbs = generateBreadcrumbsForPath(router, '/users/123', routes);

      expect(breadcrumbs).toHaveLength(3);
      expect(breadcrumbs[0].label).toBe('Home');
      expect(breadcrumbs[1].label).toBe('Users');
      expect(breadcrumbs[2].label).toBe('User');
      expect(breadcrumbs[2].route?.params).toEqual({ id: '123' });
    });

    it('should respect includeHome option', () => {
      const router = createMockRouter();
      const plugin = breadcrumbPlugin({ includeHome: false });
      plugin.install(router);

      const routes: Route[] = [
        { path: '/users', params: {}, meta: { breadcrumb: 'Users' } },
      ];

      const breadcrumbs = generateBreadcrumbsForPath(router, '/users', routes);

      expect(breadcrumbs).toHaveLength(1);
      expect(breadcrumbs[0].path).toBe('/users');
    });

    it('should use custom homeLabel', () => {
      const router = createMockRouter();
      const plugin = breadcrumbPlugin({ homeLabel: 'Start' });
      plugin.install(router);

      const routes: Route[] = [
        // No route for / to test custom homeLabel
        { path: '/users', params: {}, meta: { breadcrumb: 'Users' } },
      ];

      const breadcrumbs = generateBreadcrumbsForPath(router, '/users', routes);

      expect(breadcrumbs[0].label).toBe('Start');
    });

    it('should use custom label function', () => {
      const customLabel = vi.fn((route: Route | null, path: string) => {
        if (path === '/users') return 'All Users';
        if (path.startsWith('/users/')) return 'User Profile';
        return path;
      });

      const router = createMockRouter();
      const plugin = breadcrumbPlugin({ label: customLabel });
      plugin.install(router);

      const routes: Route[] = [
        { path: '/', params: {} },
        { path: '/users', params: {} },
      ];

      const breadcrumbs = generateBreadcrumbsForPath(router, '/users', routes);

      expect(customLabel).toHaveBeenCalled();
      expect(breadcrumbs[1].label).toBe('All Users');
    });

    it('should handle paths with no matching routes', () => {
      const router = createMockRouter();
      const plugin = breadcrumbPlugin();
      plugin.install(router);

      const routes: Route[] = [
        { path: '/', params: {} },
      ];

      const breadcrumbs = generateBreadcrumbsForPath(router, '/unknown/path', routes);

      expect(breadcrumbs).toHaveLength(3);
      expect(breadcrumbs[0].path).toBe('/');
      expect(breadcrumbs[1].path).toBe('/unknown');
      expect(breadcrumbs[2].path).toBe('/unknown/path');
    });
  });

  describe('useBreadcrumbs', () => {
    it('should provide breadcrumbs object', () => {
      const router = createMockRouter();
      const plugin = breadcrumbPlugin();

      plugin.install(router);

      const options = getBreadcrumbPluginOptions(router);
      expect(options?.BreadcrumbProvider).toBeDefined();
    });

    it('should throw error when used without provider', () => {
      // Render without BreadcrumbProvider context
      expect(() => {
        render(React.createElement(TestBreadcrumbsComponent));
      }).toThrow();
    });
  });

  describe('BreadcrumbProvider', () => {
    it('should render children', () => {
      const router = createMockRouter();
      const plugin = breadcrumbPlugin();
      plugin.install(router);

      const options = getBreadcrumbPluginOptions(router);

      render(
        React.createElement(
          options!.BreadcrumbProvider,
          {
            initialPath: '/users',
            routes: [{ path: '/users', params: {} }],
            label: options!.label,
            homeLabel: options!.homeLabel,
            includeHome: options!.includeHome,
          },
          React.createElement('div', { 'data-testid': 'child' }, 'Child')
        )
      );

      expect(screen.getByTestId('child')).toBeDefined();
    });

    it('should generate initial breadcrumbs', () => {
      const router = createMockRouter();
      const plugin = breadcrumbPlugin();
      plugin.install(router);

      const options = getBreadcrumbPluginOptions(router);
      const routes: Route[] = [
        { path: '/', params: {}, meta: { breadcrumb: 'Home' } },
        { path: '/users', params: {}, meta: { breadcrumb: 'Users' } },
      ];

      render(
        React.createElement(
          options!.BreadcrumbProvider,
          {
            initialPath: '/users',
            routes,
            label: options!.label,
            homeLabel: options!.homeLabel,
            includeHome: options!.includeHome,
          },
          React.createElement(TestBreadcrumbsComponent)
        )
      );

      expect(screen.getByTestId('crumb-0').textContent).toBe('Home:/');
      expect(screen.getByTestId('crumb-1').textContent).toBe('Users:/users');
    });

    it('should generate breadcrumbs for nested path', () => {
      const router = createMockRouter();
      const plugin = breadcrumbPlugin();
      plugin.install(router);

      const options = getBreadcrumbPluginOptions(router);
      const routes: Route[] = [
        { path: '/', params: {} },
        { path: '/admin', params: {}, meta: { breadcrumb: 'Admin' } },
        { path: '/admin/users', params: {}, meta: { breadcrumb: 'Users' } },
      ];

      render(
        React.createElement(
          options!.BreadcrumbProvider,
          {
            initialPath: '/admin/users',
            routes,
            label: options!.label,
            homeLabel: options!.homeLabel,
            includeHome: options!.includeHome,
          },
          React.createElement(TestBreadcrumbsComponent)
        )
      );

      expect(screen.getByTestId('crumb-0').textContent).toBe('Home:/');
      expect(screen.getByTestId('crumb-1').textContent).toBe('Admin:/admin');
      expect(screen.getByTestId('crumb-2').textContent).toBe('Users:/admin/users');
    });

    it('should handle dynamic routes', () => {
      const router = createMockRouter();
      const plugin = breadcrumbPlugin();
      plugin.install(router);

      const options = getBreadcrumbPluginOptions(router);
      const routes: Route[] = [
        { path: '/', params: {} },
        { path: '/users', params: {}, meta: { breadcrumb: 'Users' } },
        { path: '/users/:id', params: {}, meta: { breadcrumb: 'User' } },
      ];

      render(
        React.createElement(
          options!.BreadcrumbProvider,
          {
            initialPath: '/users/123',
            routes,
            label: options!.label,
            homeLabel: options!.homeLabel,
            includeHome: options!.includeHome,
          },
          React.createElement(TestBreadcrumbsComponent)
        )
      );

      expect(screen.getByTestId('crumb-0').textContent).toBe('Home:/');
      expect(screen.getByTestId('crumb-1').textContent).toBe('Users:/users');
      expect(screen.getByTestId('crumb-2').textContent).toBe('User:/users/123');
    });
  });

  describe('integration', () => {
    it('should work with router.use()', () => {
      const router = createMockRouter();
      const plugin = breadcrumbPlugin();

      const result = router.use(plugin);

      expect(result).toBe(router);
    });

    it('should handle empty path', () => {
      const router = createMockRouter();
      const plugin = breadcrumbPlugin();
      plugin.install(router);

      const routes: Route[] = [
        { path: '/', params: {} },
      ];

      const breadcrumbs = generateBreadcrumbsForPath(router, '/', routes);

      expect(breadcrumbs).toHaveLength(1);
      expect(breadcrumbs[0].path).toBe('/');
    });

    it('should handle deeply nested paths', () => {
      const router = createMockRouter();
      const plugin = breadcrumbPlugin();
      plugin.install(router);

      const routes: Route[] = [
        { path: '/', params: {} },
        { path: '/a', params: {} },
        { path: '/a/b', params: {} },
        { path: '/a/b/c', params: {} },
        { path: '/a/b/c/d', params: {} },
      ];

      const breadcrumbs = generateBreadcrumbsForPath(router, '/a/b/c/d', routes);

      expect(breadcrumbs).toHaveLength(5);
      expect(breadcrumbs[0].path).toBe('/');
      expect(breadcrumbs[4].path).toBe('/a/b/c/d');
    });

    it('should handle multiple dynamic segments', () => {
      const router = createMockRouter();
      const plugin = breadcrumbPlugin();
      plugin.install(router);

      const routes: Route[] = [
        { path: '/', params: {} },
        { path: '/users', params: {} },
        { path: '/users/:userId', params: {} },
        { path: '/users/:userId/posts', params: {} },
        { path: '/users/:userId/posts/:postId', params: {} },
      ];

      const breadcrumbs = generateBreadcrumbsForPath(router, '/users/123/posts/456', routes);

      expect(breadcrumbs).toHaveLength(5);
      expect(breadcrumbs[2].route?.params).toEqual({ userId: '123' });
      expect(breadcrumbs[4].route?.params).toEqual({ userId: '123', postId: '456' });
    });

    it('should generate labels when no routes match', () => {
      const router = createMockRouter();
      const plugin = breadcrumbPlugin();
      plugin.install(router);

      const routes: Route[] = [
        { path: '/', params: {} },
      ];

      const breadcrumbs = generateBreadcrumbsForPath(router, '/some/deep/path', routes);

      expect(breadcrumbs[1].label).toBe('some');
      expect(breadcrumbs[2].label).toBe('deep');
      expect(breadcrumbs[3].label).toBe('path');
    });
  });

  describe('error handling', () => {
    it('should throw when generating breadcrumbs without plugin installed', () => {
      const router = createMockRouter();
      const routes: Route[] = [];

      expect(() => {
        generateBreadcrumbsForPath(router, '/test', routes);
      }).toThrow('breadcrumbPlugin is not installed on this router');
    });
  });
});
