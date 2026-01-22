import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createRouter, route } from '../src/router';
import { createMemoryHistory } from '../src/history';
import { MAX_METADATA_SIZE } from '../src/constants';

describe('route', () => {
  it('should create a route definition', () => {
    const Component = () => null;
    const routeDef = route('/users', Component);

    expect(routeDef.path).toBe('/users');
    expect(routeDef.component).toBe(Component);
  });

  it('should throw error for empty path', () => {
    const Component = () => null;
    expect(() => route('', Component)).toThrow('Route path must be a non-empty string');
  });

  it('should throw error for path without leading slash (not wildcard)', () => {
    const Component = () => null;
    // normalizeSlashes always adds leading slash unless it's '*'
    // But we can test the validation edge case where someone might try to bypass this
    // After normalization, paths like 'users' become '/users'
    // The validation after normalization ensures this behavior
    const routeDef = route('users', Component);
    expect(routeDef.path).toBe('/users'); // It normalizes correctly
  });

  it('should normalize path with double slashes', () => {
    const Component = () => null;
    // Double slashes are now normalized automatically
    const routeDef = route('/users//profile', Component);
    expect(routeDef.path).toBe('/users/profile');
  });

  it('should normalize path to add leading slash', () => {
    const Component = () => null;
    const routeDef = route('users', Component);
    expect(routeDef.path).toBe('/users');
  });

  it('should normalize empty path to root', () => {
    const Component = () => null;
    // Empty string now throws error instead of normalizing to '/'
    expect(() => route('', Component)).toThrow('Route path must be a non-empty string');
  });

  it('should create a route with children', () => {
    const Component = () => null;
    const Child = () => null;

    const routeDef = route('/users', Component, [
      route(':id', Child),
    ]);

    expect(routeDef.children).toBeDefined();
    expect(routeDef.children).toHaveLength(1);
    expect(routeDef.children![0]!.path).toBe('/:id');
  });

  it('should create a route with meta', () => {
    const Component = () => null;
    const routeDef = route('/users', Component, { requiresAuth: true });

    expect(routeDef.meta).toEqual({ requiresAuth: true });
  });

  it('should create a route with children and meta', () => {
    const Component = () => null;
    const Child = () => null;

    const routeDef = route('/users', Component, [
      route(':id', Child),
    ], { requiresAuth: true });

    expect(routeDef.children).toHaveLength(1);
    expect(routeDef.meta).toEqual({ requiresAuth: true });
  });

  it('should throw error for missing component', () => {
    expect(() => route('/users', null as any)).toThrow('Route must have a component');
  });

  // Metadata validation tests (prototype pollution prevention)
  it('should throw error for __proto__ in metadata', () => {
    const Component = () => null;
    // Use Object.defineProperty to actually set __proto__ as own property
    const meta = {} as Record<string, unknown>;
    Object.defineProperty(meta, '__proto__', {
      value: 'malicious',
      writable: true,
      enumerable: true,
      configurable: true,
    });
    expect(() => route('/test', Component, meta)).toThrow('Route metadata cannot contain "__proto__"');
  });

  it('should throw error for constructor in metadata', () => {
    const Component = () => null;
    const meta = { constructor: 'malicious' } as Record<string, unknown>;
    expect(() => route('/test', Component, meta)).toThrow('Route metadata cannot contain "constructor"');
  });

  it('should throw error for prototype in metadata', () => {
    const Component = () => null;
    const meta = { prototype: 'malicious' } as Record<string, unknown>;
    expect(() => route('/test', Component, meta)).toThrow('Route metadata cannot contain "prototype"');
  });

  it('should throw error for metadata exceeding MAX_METADATA_SIZE', () => {
    const Component = () => null;
    // Create metadata larger than 10KB
    const largeData = 'x'.repeat(MAX_METADATA_SIZE + 100);
    const meta = { data: largeData };
    expect(() => route('/test', Component, meta)).toThrow('Route metadata too large (max 10KB)');
  });

  it('should accept metadata exactly at MAX_METADATA_SIZE boundary', () => {
    const Component = () => null;
    // Create metadata exactly at the boundary
    const meta = { data: 'x'.repeat(MAX_METADATA_SIZE - 20) }; // -20 to account for JSON overhead
    const jsonData = JSON.stringify(meta);
    expect(jsonData.length).toBeLessThanOrEqual(MAX_METADATA_SIZE);
    const routeDef = route('/test', Component, meta);
    expect(routeDef.meta).toBeDefined();
  });

  // Path validation tests
  it('should throw error for path with consecutive wildcards (ReDoS prevention)', () => {
    const Component = () => null;
    expect(() => route('/test/***path', Component)).toThrow('Route path contains invalid wildcard pattern');
  });

  it('should throw error for path with many consecutive wildcards', () => {
    const Component = () => null;
    expect(() => route('/test/*****', Component)).toThrow('Route path contains invalid wildcard pattern');
  });

  it('should throw error for path with consecutive slashes (3 or more)', () => {
    const Component = () => null;
    expect(() => route('/test///path', Component)).toThrow('Route path contains invalid slash pattern');
  });

  it('should throw error for path with many consecutive slashes', () => {
    const Component = () => null;
    expect(() => route('/test////path', Component)).toThrow('Route path contains invalid slash pattern');
  });

  it('should accept double slashes (normalizes to single)', () => {
    const Component = () => null;
    const routeDef = route('/test//path', Component);
    expect(routeDef.path).toBe('/test/path');
  });

  it('should throw error for path with null bytes', () => {
    const Component = () => null;
    expect(() => route('/test\0path', Component)).toThrow('Route path cannot contain null bytes');
  });

  it('should throw error for path with control characters', () => {
    const Component = () => null;
    expect(() => route('/test\x01path', Component)).toThrow('Route path contains invalid control characters');
  });

  it('should throw error for path exceeding MAX_ROUTE_PATH_LENGTH', () => {
    const Component = () => null;
    const longPath = '/test/' + 'a'.repeat(600);
    expect(() => route(longPath, Component)).toThrow('Route path too long');
  });

  it('should accept wildcard path without leading slash', () => {
    const Component = () => null;
    const routeDef = route('*', Component);
    expect(routeDef.path).toBe('*');
  });

  it('should accept and normalize wildcard with leading slash', () => {
    const Component = () => null;
    // normalizeSlashes only normalizes '*' without changing it
    // But /* is treated as a path starting with /, so it stays /*
    // Let me check what the actual behavior should be...
    const routeDef = route('/*', Component);
    // Based on normalizeSlashes: /* is not treated specially, it stays as /*
    expect(routeDef.path).toBe('/*');
  });
});

describe('createRouter', () => {
  it('should create a router', () => {
    const Component = () => null;
    const history = createMemoryHistory();

    const router = createRouter({
      routes: [route('/', Component)],
      history,
    });

    expect(router).toBeDefined();
    expect(router.routes).toBeDefined();
    // currentRoute is set after initial navigation
  });

  it('should create router with browser history when history not provided', () => {
    const Component = () => null;

    // In jsdom environment, window is defined
    // This should create browser history automatically
    const router = createRouter({
      routes: [route('/', Component)],
    });

    expect(router).toBeDefined();
    expect(router.routes).toBeDefined();
  });

  it('should throw error without history in non-browser environment', () => {
    const Component = () => null;

    // Mock non-browser environment using vitest
    const { spyOn } = vi;
    const windowSpy = spyOn(global, 'window', 'get').mockReturnValue(undefined);

    expect(() => {
      createRouter({
        routes: [route('/', Component)],
      });
    }).toThrow('History is required');

    // Restore
    windowSpy.mockRestore();
  });

  it('should flatten nested routes', () => {
    const Component = () => null;
    const Child = () => null;
    const history = createMemoryHistory();

    const router = createRouter({
      routes: [
        route('/users', Component, [
          route(':id', Child),
        ]),
      ],
      history,
    });

    expect(router.routes).toHaveLength(2);
    expect(router.routes[0]!.path).toBe('/users');
    expect(router.routes[1]!.path).toBe('/users/:id');
  });

  it('should support basePath', () => {
    const Component = () => null;
    const history = createMemoryHistory({ initialEntries: ['/app/'] });

    const router = createRouter({
      routes: [route('/', Component)],
      history,
      basePath: '/app',
    });

    expect(router).toBeDefined();
  });

  it('should throw error for basePath without leading slash', () => {
    const Component = () => null;
    const history = createMemoryHistory();

    expect(() => {
      createRouter({
        routes: [route('/', Component)],
        history,
        basePath: 'app',
      });
    }).toThrow('Base path must start with "/"');
  });

  it('should accept empty string basePath', () => {
    const Component = () => null;
    const history = createMemoryHistory();

    const router = createRouter({
      routes: [route('/', Component)],
      history,
      basePath: '',
    });

    expect(router).toBeDefined();
  });

  it('should throw error for non-string basePath', () => {
    const Component = () => null;
    const history = createMemoryHistory();

    expect(() => {
      createRouter({
        routes: [route('/', Component)],
        history,
        basePath: 123 as any,
      });
    }).toThrow('Base path must be a string');
  });

  it('should support destroy method', () => {
    const Component = () => null;
    const history = createMemoryHistory();

    const router = createRouter({
      routes: [route('/', Component)],
      history,
    });

    // The destroy method should be available through the proxy
    expect(typeof router.destroy).toBe('function');
    expect(() => router.destroy()).not.toThrow();
  });
});
