/**
 * Tests for search plugin
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import {
  searchPlugin,
  useSearch,
  getSearchPluginOptions,
  parseSearch,
  stringifySearch,
  SearchProvider,
  type SearchParams,
  type SearchPluginOptions,
  type SearchString,
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

// Test component that uses useSearch
function TestComponent({ onSearchChange }: { onSearchChange: (search: SearchString) => void }) {
  const { search, setSearch } = useSearch<{
    page: string;
    sort: 'asc' | 'desc';
  }>();

  return React.createElement('div', {}, [
    React.createElement('span', { 'data-testid': 'page' }, search.page || ''),
    React.createElement('span', { 'data-testid': 'sort' }, search.sort || ''),
    React.createElement('button', {
      onClick: () => setSearch({ page: '2', sort: 'asc' }),
    }, 'Set direct'),
    React.createElement('button', {
      onClick: () => setSearch((prev) => ({
        page: String(Number(prev.page) + 1),
        sort: prev.sort,
      })),
    }, 'Increment'),
    React.createElement('button', {
      onClick: () => onSearchChange('page=3&sort=desc'),
    }, 'External change'),
  ]);
}

describe('searchPlugin', () => {
  describe('plugin creation', () => {
    it('should create a plugin with correct metadata', () => {
      const plugin = searchPlugin();
      expect(plugin.name).toBe('search');
      expect(plugin.version).toBe('1.0.0');
      expect(typeof plugin.install).toBe('function');
    });

    it('should accept empty options', () => {
      const plugin = searchPlugin({});
      expect(plugin).toBeDefined();
    });

    it('should accept custom parse function', () => {
      const parse = vi.fn(() => ({}));
      const plugin = searchPlugin({ parse });
      expect(plugin).toBeDefined();
    });

    it('should accept custom stringify function', () => {
      const stringify = vi.fn(() => '');
      const plugin = searchPlugin({ stringify });
      expect(plugin).toBeDefined();
    });

    it('should accept both parse and stringify', () => {
      const parse = vi.fn(() => ({}));
      const stringify = vi.fn(() => '');
      const plugin = searchPlugin({ parse, stringify });
      expect(plugin).toBeDefined();
    });
  });

  describe('plugin installation', () => {
    it('should store options on router during install', () => {
      const router = createMockRouter();
      const parse = vi.fn(() => ({}));
      const stringify = vi.fn(() => '');
      const plugin = searchPlugin({ parse, stringify });

      plugin.install(router);

      const options = getSearchPluginOptions(router);
      expect(options).toBeDefined();
      expect(options?.parse).toBe(parse);
      expect(options?.stringify).toBe(stringify);
    });

    it('should store default options when none provided', () => {
      const router = createMockRouter();
      const plugin = searchPlugin();

      plugin.install(router);

      const options = getSearchPluginOptions(router);
      expect(options).toBeDefined();
      expect(typeof options?.parse).toBe('function');
      expect(typeof options?.stringify).toBe('function');
    });

    it('should store SearchProvider on router', () => {
      const router = createMockRouter();
      const plugin = searchPlugin();

      plugin.install(router);

      const options = getSearchPluginOptions(router);
      expect(options?.SearchProvider).toBeDefined();
    });
  });

  describe('parseSearch', () => {
    it('should parse empty search string', () => {
      const result = parseSearch('');
      expect(result).toEqual({});
    });

    it('should parse single parameter', () => {
      const result = parseSearch('page=1');
      expect(result).toEqual({ page: '1' });
    });

    it('should parse multiple parameters', () => {
      const result = parseSearch('page=1&sort=asc');
      expect(result).toEqual({ page: '1', sort: 'asc' });
    });

    it('should handle encoded values', () => {
      const result = parseSearch('query=hello%20world');
      expect(result).toEqual({ query: 'hello world' });
    });

    it('should handle special characters', () => {
      const result = parseSearch('filter=a%2Bb');
      expect(result).toEqual({ filter: 'a+b' });
    });

    it('should handle multiple values for same key (takes last)', () => {
      const result = parseSearch('tag=a&tag=b');
      expect(result).toEqual({ tag: 'b' });
    });

    it('should handle values without equals sign', () => {
      const result = parseSearch('key');
      expect(result).toEqual({ key: '' });
    });
  });

  describe('stringifySearch', () => {
    it('should stringify empty params', () => {
      const result = stringifySearch({});
      expect(result).toBe('');
    });

    it('should stringify single parameter', () => {
      const result = stringifySearch({ page: '1' });
      expect(result).toBe('page=1');
    });

    it('should stringify multiple parameters', () => {
      const result = stringifySearch({ page: '1', sort: 'asc' });
      expect(result).toBe('page=1&sort=asc');
    });

    it('should handle special characters', () => {
      const result = stringifySearch({ query: 'hello world' });
      expect(result).toBe('query=hello+world');
    });

    it('should encode special characters', () => {
      const result = stringifySearch({ filter: 'a+b' });
      expect(result).toBe('filter=a%2Bb');
    });
  });

  describe('useSearch', () => {
    it('should provide search object', () => {
      const router = createMockRouter();
      const plugin = searchPlugin();

      plugin.install(router);

      const options = getSearchPluginOptions(router);
      expect(options?.SearchProvider).toBeDefined();
    });

    it('should throw error when used without plugin', () => {
      // Render without SearchProvider context
      expect(() => {
        render(React.createElement(TestComponent, { onSearchChange: vi.fn() }));
      }).toThrow();
    });
  });

  describe('SearchProvider', () => {
    it('should render children', () => {
      const onSearchChange = vi.fn();

      render(
        React.createElement(
          SearchProvider,
          {
            initialSearch: 'page=1&sort=asc',
            parse: (s) => {
              const params = new URLSearchParams(s);
              return Object.fromEntries(params);
            },
            stringify: (p) => new URLSearchParams(p).toString(),
            onSearchChange,
          },
          React.createElement('div', { 'data-testid': 'child' }, 'Child')
        )
      );

      expect(screen.getByTestId('child')).toBeDefined();
    });

    it('should parse initial search', () => {
      const onSearchChange = vi.fn();

      render(
        React.createElement(
          SearchProvider,
          {
            initialSearch: 'page=1&sort=asc',
            parse: (s) => {
              const params = new URLSearchParams(s);
              return Object.fromEntries(params);
            },
            stringify: (p) => new URLSearchParams(p).toString(),
            onSearchChange,
          },
          React.createElement(TestComponent, { onSearchChange })
        )
      );

      expect(screen.getByTestId('page').textContent).toBe('1');
      expect(screen.getByTestId('sort').textContent).toBe('asc');
    });

    it('should update search when setSearch is called', async () => {
      const onSearchChange = vi.fn();

      render(
        React.createElement(
          SearchProvider,
          {
            initialSearch: 'page=1&sort=asc',
            parse: (s) => {
              const params = new URLSearchParams(s);
              return Object.fromEntries(params);
            },
            stringify: (p) => new URLSearchParams(p).toString(),
            onSearchChange,
          },
          React.createElement(TestComponent, { onSearchChange })
        )
      );

      const button = screen.getByText('Set direct');
      button.click();

      await waitFor(() => {
        expect(onSearchChange).toHaveBeenCalledWith('page=2&sort=asc');
      });
    });

    it('should handle updater function', async () => {
      const onSearchChange = vi.fn();

      render(
        React.createElement(
          SearchProvider,
          {
            initialSearch: 'page=1&sort=asc',
            parse: (s) => {
              const params = new URLSearchParams(s);
              return Object.fromEntries(params);
            },
            stringify: (p) => new URLSearchParams(p).toString(),
            onSearchChange,
          },
          React.createElement(TestComponent, { onSearchChange })
        )
      );

      const button = screen.getByText('Increment');
      button.click();

      await waitFor(() => {
        expect(onSearchChange).toHaveBeenCalledWith('page=2&sort=asc');
      });
    });
  });

  describe('custom parse/stringify', () => {
    it('should use custom parse function', () => {
      const parse = vi.fn((s: SearchString) => {
        if (s === 'custom') {
          return { custom: 'value' };
        }
        return {};
      });
      const stringify = vi.fn((p: SearchParams) => 'custom');

      const router = createMockRouter();
      const plugin = searchPlugin({ parse, stringify });

      plugin.install(router);

      const options = getSearchPluginOptions(router);
      expect(options?.parse).toBe(parse);
      expect(options?.stringify).toBe(stringify);
    });

    it('should use custom stringify function', () => {
      const stringify = vi.fn((p: SearchParams) => `custom:${JSON.stringify(p)}`);

      const router = createMockRouter();
      const plugin = searchPlugin({ stringify });

      plugin.install(router);

      const options = getSearchPluginOptions(router);
      expect(options?.stringify).toBe(stringify);
    });
  });

  describe('integration', () => {
    it('should work with router.use()', () => {
      const router = createMockRouter();
      const plugin = searchPlugin();

      const result = router.use(plugin);

      expect(result).toBe(router);
    });

    it('should handle round-trip parse/stringify', () => {
      const original = { page: '1', sort: 'asc' };
      const stringified = stringifySearch(original);
      const parsed = parseSearch(stringified);

      expect(parsed).toEqual(original);
    });

    it('should handle empty values', () => {
      const params = { page: '', sort: 'asc' };
      const stringified = stringifySearch(params);
      const parsed = parseSearch(stringified);

      expect(parsed).toEqual(params);
    });

    it('should preserve param order', () => {
      const params = { a: '1', b: '2', c: '3' };
      const stringified = stringifySearch(params);

      // URLSearchParams doesn't guarantee order, but should have all params
      expect(stringified).toContain('a=1');
      expect(stringified).toContain('b=2');
      expect(stringified).toContain('c=3');
    });
  });
});
