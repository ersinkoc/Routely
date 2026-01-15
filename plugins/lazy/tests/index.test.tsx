/**
 * Tests for lazy plugin
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import {
  lazyPlugin,
  lazy,
  isLazyComponent,
  LazyErrorBoundary,
  DefaultErrorFallback,
  DefaultLoadingFallback,
  getLazyComponentOptions,
  createLazyWithTimeout,
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

// Mock component
const MockComponent = () => React.createElement('div', {}, 'Mock Component');

describe('lazyPlugin', () => {
  describe('plugin creation', () => {
    it('should create a plugin with correct metadata', () => {
      const plugin = lazyPlugin();
      expect(plugin.name).toBe('lazy');
      expect(plugin.version).toBe('1.0.0');
      expect(typeof plugin.install).toBe('function');
    });

    it('should accept empty options', () => {
      const plugin = lazyPlugin({});
      expect(plugin).toBeDefined();
    });

    it('should accept options with fallback', () => {
      const fallback = React.createElement('div', {}, 'Loading...');
      const plugin = lazyPlugin({ fallback });
      expect(plugin).toBeDefined();
    });

    it('should accept options with timeout', () => {
      const plugin = lazyPlugin({ timeout: 5000 });
      expect(plugin).toBeDefined();
    });

    it('should accept options with error component', () => {
      const ErrorComponent = () => React.createElement('div', {}, 'Error');
      const plugin = lazyPlugin({ error: ErrorComponent });
      expect(plugin).toBeDefined();
    });

    it('should accept all options', () => {
      const fallback = React.createElement('div', {}, 'Loading...');
      const ErrorComponent = () => React.createElement('div', {}, 'Error');
      const plugin = lazyPlugin({
        fallback,
        timeout: 10000,
        error: ErrorComponent,
      });
      expect(plugin).toBeDefined();
    });
  });

  describe('plugin installation', () => {
    it('should store options on router during install', () => {
      const router = createMockRouter();
      const options = { timeout: 5000 };
      const plugin = lazyPlugin(options);

      plugin.install(router);

      expect((router as any)[Symbol.for('lazy-plugin-options')]).toEqual(options);
    });

    it('should store empty options if none provided', () => {
      const router = createMockRouter();
      const plugin = lazyPlugin();

      plugin.install(router);

      expect((router as any)[Symbol.for('lazy-plugin-options')]).toEqual({});
    });
  });
});

describe('lazy', () => {
  it('should create a lazy component', () => {
    const loader = () => Promise.resolve({ default: MockComponent });
    const LazyComponent = lazy(loader);

    expect(isLazyComponent(LazyComponent)).toBe(true);
  });

  it('should attach lazy metadata', () => {
    const loader = () => Promise.resolve({ default: MockComponent });
    const LazyComponent = lazy(loader);

    expect(LazyComponent[Symbol.for('routely.lazy')]).toBe(true);
    expect(LazyComponent[Symbol.for('routely.lazy.options')]).toEqual({});
  });

  it('should accept empty options', () => {
    const loader = () => Promise.resolve({ default: MockComponent });
    const LazyComponent = lazy(loader, {});

    expect(isLazyComponent(LazyComponent)).toBe(true);
  });

  it('should store options on component', () => {
    const loader = () => Promise.resolve({ default: MockComponent });
    const fallback = React.createElement('div', {}, 'Custom Loading');
    const options = { fallback };
    const LazyComponent = lazy(loader, options);

    expect(LazyComponent[Symbol.for('routely.lazy.options')]).toEqual(options);
  });

  it('should store timeout option', () => {
    const loader = () => Promise.resolve({ default: MockComponent });
    const options = { timeout: 5000 };
    const LazyComponent = lazy(loader, options);

    expect(LazyComponent[Symbol.for('routely.lazy.options')]).toEqual(options);
  });

  it('should store both fallback and timeout options', () => {
    const loader = () => Promise.resolve({ default: MockComponent });
    const fallback = React.createElement('div', {}, 'Loading');
    const options = { fallback, timeout: 3000 };
    const LazyComponent = lazy(loader, options);

    expect(LazyComponent[Symbol.for('routely.lazy.options')]).toEqual(options);
  });
});

describe('isLazyComponent', () => {
  it('should return true for lazy components', () => {
    const loader = () => Promise.resolve({ default: MockComponent });
    const LazyComponent = lazy(loader);

    expect(isLazyComponent(LazyComponent)).toBe(true);
  });

  it('should return false for regular components', () => {
    expect(isLazyComponent(MockComponent)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isLazyComponent(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isLazyComponent(undefined)).toBe(false);
  });

  it('should return false for non-component objects', () => {
    expect(isLazyComponent({})).toBe(false);
    expect(isLazyComponent([])).toBe(false);
    expect(isLazyComponent('string')).toBe(false);
    expect(isLazyComponent(123)).toBe(false);
  });
});

describe('LazyErrorBoundary', () => {

  it('should render children when no error', () => {
    const child = React.createElement('div', { 'data-testid': 'child' }, 'Child');
    const { container } = render(
      React.createElement(LazyErrorBoundary, {}, child)
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('should render default error component on error', () => {
    const ErrorComponent = () =>
      React.createElement('div', { 'data-testid': 'error' }, 'Error occurred');
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      React.createElement(
        LazyErrorBoundary,
        { ErrorComponent },
        React.createElement(ThrowError)
      )
    );

    expect(screen.getByTestId('error')).toBeInTheDocument();
  });

  it('should render DefaultErrorFallback when no custom error component', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      React.createElement(LazyErrorBoundary, {}, React.createElement(ThrowError))
    );

    expect(screen.getByText('Failed to load page')).toBeInTheDocument();
  });

  it('should call onRetry when retry button is clicked', async () => {
    const onRetry = vi.fn();
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      React.createElement(
        LazyErrorBoundary,
        { onRetry },
        React.createElement(ThrowError)
      )
    );

    const retryButton = screen.getByRole('button', { name: 'Retry' });
    retryButton.click();

    await waitFor(() => {
      expect(onRetry).toHaveBeenCalled();
    });
  });

  it('should reset error state after retry', async () => {
    let shouldThrow = true;
    const ToggleComponent = () => {
      if (shouldThrow) {
        throw new Error('Test error');
      }
      return React.createElement('div', { 'data-testid': 'success' }, 'Success');
    };

    const { rerender } = render(
      React.createElement(LazyErrorBoundary, {}, React.createElement(ToggleComponent))
    );

    expect(screen.getByText('Failed to load page')).toBeInTheDocument();

    // Click retry to reset error state
    const retryButton = screen.getByRole('button', { name: 'Retry' });
    retryButton.click();

    // Toggle the component to not throw
    shouldThrow = false;
    rerender(React.createElement(LazyErrorBoundary, {}, React.createElement(ToggleComponent)));

    await waitFor(() => {
      expect(screen.queryByText('Failed to load page')).not.toBeInTheDocument();
      expect(screen.getByTestId('success')).toBeInTheDocument();
    });
  });

  it('should display error message', () => {
    const testError = new Error('Custom error message');
    const ThrowError = () => {
      throw testError;
    };

    render(
      React.createElement(LazyErrorBoundary, {}, React.createElement(ThrowError))
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('should render DefaultLoadingFallback', () => {
    render(React.createElement(DefaultLoadingFallback));
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});

describe('getLazyComponentOptions', () => {

  it('should return options for lazy components', () => {
    const loader = () => Promise.resolve({ default: MockComponent });
    const options = { timeout: 5000 };
    const LazyComponent = lazy(loader, options);

    expect(getLazyComponentOptions(LazyComponent)).toEqual(options);
  });

  it('should return undefined for non-lazy components', () => {
    expect(getLazyComponentOptions(MockComponent)).toBeUndefined();
  });

  it('should return undefined for null', () => {
    expect(getLazyComponentOptions(null)).toBeUndefined();
  });

  it('should return undefined for undefined', () => {
    expect(getLazyComponentOptions(undefined)).toBeUndefined();
  });

  it('should return empty options when no options provided', () => {
    const loader = () => Promise.resolve({ default: MockComponent });
    const LazyComponent = lazy(loader);

    expect(getLazyComponentOptions(LazyComponent)).toEqual({});
  });

  it('should return options with fallback', () => {
    const loader = () => Promise.resolve({ default: MockComponent });
    const fallback = React.createElement('div', {}, 'Custom Loading');
    const options = { fallback };
    const LazyComponent = lazy(loader, options);

    expect(getLazyComponentOptions(LazyComponent)?.fallback).toEqual(fallback);
  });
});

describe('createLazyWithTimeout', () => {

  it('should create a lazy component with timeout', () => {
    const loader = () => Promise.resolve({ default: MockComponent });
    const LazyComponent = createLazyWithTimeout(loader, 5000);

    expect(isLazyComponent(LazyComponent)).toBe(true);
  });

  it('should attach timeout option to lazy component', () => {
    const loader = () => Promise.resolve({ default: MockComponent });
    const timeout = 3000;
    const LazyComponent = createLazyWithTimeout(loader, timeout);

    expect(getLazyComponentOptions(LazyComponent)?.timeout).toBe(timeout);
  });

  it('should store timeout metadata on component', () => {
    const loader = () => Promise.resolve({ default: MockComponent });
    const LazyComponent = createLazyWithTimeout(loader, 5000);

    expect(LazyComponent[Symbol.for('routely.lazy')]).toBe(true);
    expect(LazyComponent[Symbol.for('routely.lazy.options')]).toEqual({ timeout: 5000 });
  });

  it('should execute loader function when rendered', async () => {
    let loaderCalled = false;
    const loader = () => {
      loaderCalled = true;
      return Promise.resolve({ default: MockComponent });
    };
    const LazyComponent = createLazyWithTimeout(loader, 5000);

    // Render the component to trigger the loader
    render(React.createElement(LazyComponent));

    await waitFor(() => {
      expect(loaderCalled).toBe(true);
    });
  });
});

describe('integration', () => {
  it('should work with router.use()', () => {
    const router = createMockRouter();
    const plugin = lazyPlugin({ timeout: 5000 });

    const result = router.use(plugin);

    expect(result).toBe(router);
  });

  it('should allow multiple lazy components with different options', () => {
    const loader1 = () => Promise.resolve({ default: MockComponent });
    const loader2 = () => Promise.resolve({ default: MockComponent });

    const Lazy1 = lazy(loader1, { timeout: 1000 });
    const Lazy2 = lazy(loader2, { timeout: 5000 });

    expect(Lazy1[Symbol.for('routely.lazy.options')].timeout).toBe(1000);
    expect(Lazy2[Symbol.for('routely.lazy.options')].timeout).toBe(5000);
  });

  it('should handle plugin with all options', () => {
    const router = createMockRouter();
    const fallback = React.createElement('div', {}, 'Fallback');
    const ErrorComponent = () => React.createElement('div', {}, 'Error');

    const plugin = lazyPlugin({
      fallback,
      timeout: 10000,
      error: ErrorComponent,
    });

    router.use(plugin);

    expect((router as any)[Symbol.for('lazy-plugin-options')]).toEqual({
      fallback,
      timeout: 10000,
      error: ErrorComponent,
    });
  });
});
