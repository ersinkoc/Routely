/**
 * Tests for devtools plugin
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  devtoolsPlugin,
  useDevTools,
  getDevToolsPluginOptions,
  getDevToolsHistory,
  getDevToolsPlugins,
  DevToolsProvider,
  type DevToolsPluginOptions,
  type HistoryEntry,
  type PluginInfo,
} from '../src/index';
import type { Router, Route } from '@oxog/routely-core';

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

// Test component that uses useDevTools
function TestDevToolsComponent() {
  const { history, plugins, currentRoute } = useDevTools();

  return React.createElement('div', { 'data-testid': 'devtools' }, [
    React.createElement('div', { 'data-testid': 'history-count', key: 'history' }, String(history.length)),
    React.createElement('div', { 'data-testid': 'plugins-count', key: 'plugins' }, String(plugins.length)),
    React.createElement('div', {
      'data-testid': 'current-route',
      key: 'route'
    }, currentRoute?.path || 'none'),
  ]);
}

describe('devtoolsPlugin', () => {
  describe('plugin creation', () => {
    it('should create a plugin with correct metadata', () => {
      const plugin = devtoolsPlugin();
      expect(plugin.name).toBe('devtools');
      expect(plugin.version).toBe('1.0.0');
      expect(typeof plugin.install).toBe('function');
    });

    it('should accept empty options', () => {
      const plugin = devtoolsPlugin({});
      expect(plugin).toBeDefined();
    });

    it('should accept maxHistorySize option', () => {
      const plugin = devtoolsPlugin({ maxHistorySize: 50 });
      expect(plugin).toBeDefined();
    });

    it('should accept position option', () => {
      const plugin = devtoolsPlugin({ position: 'top-left' });
      expect(plugin).toBeDefined();
    });

    it('should accept trackHistory option', () => {
      const plugin = devtoolsPlugin({ trackHistory: false });
      expect(plugin).toBeDefined();
    });

    it('should accept all options', () => {
      const plugin = devtoolsPlugin({
        maxHistorySize: 50,
        position: 'bottom-left',
        trackHistory: true,
      });
      expect(plugin).toBeDefined();
    });
  });

  describe('plugin installation', () => {
    it('should store options on router during install', () => {
      const router = createMockRouter();
      const plugin = devtoolsPlugin({
        maxHistorySize: 50,
        position: 'top-right',
        trackHistory: false,
      });

      plugin.install(router);

      const options = getDevToolsPluginOptions(router);
      expect(options).toBeDefined();
      expect(options?.maxHistorySize).toBe(50);
      expect(options?.position).toBe('top-right');
      expect(options?.trackHistory).toBe(false);
    });

    it('should store default options when none provided', () => {
      const router = createMockRouter();
      const plugin = devtoolsPlugin();

      plugin.install(router);

      const options = getDevToolsPluginOptions(router);
      expect(options).toBeDefined();
      expect(options?.maxHistorySize).toBe(100);
      expect(options?.position).toBe('bottom-right');
      expect(options?.trackHistory).toBe(true);
    });

    it('should store DevToolsProvider on router', () => {
      const router = createMockRouter();
      const plugin = devtoolsPlugin();

      plugin.install(router);

      const options = getDevToolsPluginOptions(router);
      expect(options?.DevToolsProvider).toBeDefined();
    });

    it('should initialize empty history', () => {
      const router = createMockRouter();
      const plugin = devtoolsPlugin();

      plugin.install(router);

      const history = getDevToolsHistory(router);
      expect(history).toEqual([]);
    });

    it('should initialize empty plugins list', () => {
      const router = createMockRouter();
      const plugin = devtoolsPlugin();

      plugin.install(router);

      const plugins = getDevToolsPlugins(router);
      expect(plugins).toEqual([]);
    });
  });

  describe('navigation history tracking', () => {
    it('should track navigate calls', async () => {
      const router = createMockRouter();
      const plugin = devtoolsPlugin({ trackHistory: true });

      plugin.install(router);

      await router.navigate('/users');

      const history = getDevToolsHistory(router);
      expect(history).toHaveLength(1);
      expect(history[0].path).toBe('/users');
      expect(history[0].type).toBe('navigate');
      expect(history[0].timestamp).toBeGreaterThan(0);
    });

    it('should track multiple navigations', async () => {
      const router = createMockRouter();
      const plugin = devtoolsPlugin({ trackHistory: true });

      plugin.install(router);

      await router.navigate('/users');
      await router.navigate('/posts');
      await router.navigate('/settings');

      const history = getDevToolsHistory(router);
      expect(history).toHaveLength(3);
      expect(history[0].path).toBe('/users');
      expect(history[1].path).toBe('/posts');
      expect(history[2].path).toBe('/settings');
    });

    it('should respect maxHistorySize', async () => {
      const router = createMockRouter();
      const plugin = devtoolsPlugin({ maxHistorySize: 3, trackHistory: true });

      plugin.install(router);

      await router.navigate('/1');
      await router.navigate('/2');
      await router.navigate('/3');
      await router.navigate('/4');
      await router.navigate('/5');

      const history = getDevToolsHistory(router);
      expect(history).toHaveLength(3);
      expect(history[0].path).toBe('/3');
      expect(history[1].path).toBe('/4');
      expect(history[2].path).toBe('/5');
    });

    it('should not track history when trackHistory is false', async () => {
      const router = createMockRouter();
      const plugin = devtoolsPlugin({ trackHistory: false });

      plugin.install(router);

      await router.navigate('/users');

      const history = getDevToolsHistory(router);
      expect(history).toHaveLength(0);
    });
  });

  describe('plugin registry', () => {
    it('should track plugin registrations', () => {
      const router = createMockRouter();
      const devtools = devtoolsPlugin();

      devtools.install(router);

      const testPlugin = {
        name: 'test',
        version: '1.0.0',
        install: vi.fn(),
      };

      router.use(testPlugin);

      const plugins = getDevToolsPlugins(router);
      expect(plugins).toHaveLength(1);
      expect(plugins[0].name).toBe('test');
      expect(plugins[0].version).toBe('1.0.0');
    });

    it('should track multiple plugins', () => {
      const router = createMockRouter();
      const devtools = devtoolsPlugin();

      devtools.install(router);

      const plugin1 = {
        name: 'plugin1',
        version: '1.0.0',
        install: vi.fn(),
      };
      const plugin2 = {
        name: 'plugin2',
        version: '2.0.0',
        description: 'Test plugin',
        install: vi.fn(),
      };

      router.use(plugin1);
      router.use(plugin2);

      const plugins = getDevToolsPlugins(router);
      expect(plugins).toHaveLength(2);
      expect(plugins[0].name).toBe('plugin1');
      expect(plugins[1].name).toBe('plugin2');
      expect(plugins[1].description).toBe('Test plugin');
    });

    it('should handle plugins without name', () => {
      const router = createMockRouter();
      const devtools = devtoolsPlugin();

      devtools.install(router);

      const plugin = {
        install: vi.fn(),
      };

      router.use(plugin);

      const plugins = getDevToolsPlugins(router);
      expect(plugins).toHaveLength(1);
      expect(plugins[0].name).toBe('unknown');
    });
  });

  describe('useDevTools', () => {
    it('should provide devtools state', () => {
      const router = createMockRouter();
      const plugin = devtoolsPlugin();

      plugin.install(router);

      const options = getDevToolsPluginOptions(router);
      expect(options?.DevToolsProvider).toBeDefined();
    });

    it('should throw error when used without provider', () => {
      // Render without DevToolsProvider context
      expect(() => {
        render(React.createElement(TestDevToolsComponent));
      }).toThrow();
    });
  });

  describe('DevToolsProvider', () => {
    it('should render children', () => {
      const router = createMockRouter();
      const plugin = devtoolsPlugin();
      plugin.install(router);

      const options = getDevToolsPluginOptions(router);

      render(
        React.createElement(
          options!.DevToolsProvider,
          {
            history: [],
            plugins: [],
            currentRoute: null,
          },
          React.createElement('div', { 'data-testid': 'child' }, 'Child')
        )
      );

      expect(screen.getByTestId('child')).toBeDefined();
    });

    it('should provide history to context', () => {
      const router = createMockRouter();
      const plugin = devtoolsPlugin();
      plugin.install(router);

      const options = getDevToolsPluginOptions(router);
      const history: HistoryEntry[] = [
        { path: '/users', timestamp: Date.now(), type: 'navigate' },
      ];

      render(
        React.createElement(
          options!.DevToolsProvider,
          {
            history,
            plugins: [],
            currentRoute: null,
          },
          React.createElement(TestDevToolsComponent)
        )
      );

      expect(screen.getByTestId('history-count').textContent).toBe('1');
    });

    it('should provide plugins to context', () => {
      const router = createMockRouter();
      const plugin = devtoolsPlugin();
      plugin.install(router);

      const options = getDevToolsPluginOptions(router);
      const plugins: PluginInfo[] = [
        { name: 'test', version: '1.0.0' },
      ];

      render(
        React.createElement(
          options!.DevToolsProvider,
          {
            history: [],
            plugins,
            currentRoute: null,
          },
          React.createElement(TestDevToolsComponent)
        )
      );

      expect(screen.getByTestId('plugins-count').textContent).toBe('1');
    });

    it('should provide currentRoute to context', () => {
      const router = createMockRouter();
      const plugin = devtoolsPlugin();
      plugin.install(router);

      const options = getDevToolsPluginOptions(router);
      const route: Route = {
        path: '/users',
        params: { id: '123' },
      };

      render(
        React.createElement(
          options!.DevToolsProvider,
          {
            history: [],
            plugins: [],
            currentRoute: route,
          },
          React.createElement(TestDevToolsComponent)
        )
      );

      expect(screen.getByTestId('current-route').textContent).toBe('/users');
    });
  });

  describe('integration', () => {
    it('should work with router.use()', () => {
      const router = createMockRouter();
      const plugin = devtoolsPlugin();

      const result = router.use(plugin);

      expect(result).toBe(router);
    });

    it('should handle empty history', () => {
      const router = createMockRouter();
      const plugin = devtoolsPlugin();

      plugin.install(router);

      const history = getDevToolsHistory(router);
      expect(history).toEqual([]);
    });

    it('should handle empty plugins list', () => {
      const router = createMockRouter();
      const plugin = devtoolsPlugin();

      plugin.install(router);

      const plugins = getDevToolsPlugins(router);
      expect(plugins).toEqual([]);
    });

    it('should provide default position', () => {
      const router = createMockRouter();
      const plugin = devtoolsPlugin();

      plugin.install(router);

      const options = getDevToolsPluginOptions(router);
      expect(options?.position).toBe('bottom-right');
    });

    it('should accept all position options', () => {
      const positions: Array<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'> = [
        'top-left',
        'top-right',
        'bottom-left',
        'bottom-right',
      ];

      positions.forEach((position) => {
        const router = createMockRouter();
        const plugin = devtoolsPlugin({ position });

        plugin.install(router);

        const options = getDevToolsPluginOptions(router);
        expect(options?.position).toBe(position);
      });
    });
  });

  describe('history entry types', () => {
    it('should create navigate type entries', async () => {
      const router = createMockRouter();
      const plugin = devtoolsPlugin({ trackHistory: true });

      plugin.install(router);

      await router.navigate('/test');

      const history = getDevToolsHistory(router);
      expect(history[0].type).toBe('navigate');
    });

    it('should handle history entries with all required fields', async () => {
      const router = createMockRouter();
      const plugin = devtoolsPlugin({ trackHistory: true });

      plugin.install(router);

      await router.navigate('/test');

      const history = getDevToolsHistory(router);
      const entry = history[0];

      expect(entry.path).toBeDefined();
      expect(entry.timestamp).toBeDefined();
      expect(entry.type).toBeDefined();
      expect(typeof entry.path).toBe('string');
      expect(typeof entry.timestamp).toBe('number');
      expect(['navigate', 'back', 'forward', 'go']).toContain(entry.type);
    });
  });
});
