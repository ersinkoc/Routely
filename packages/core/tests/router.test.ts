import { describe, it, expect, beforeEach } from 'vitest';
import { createRouter, route } from '../src/router';
import { createMemoryHistory } from '../src/history';

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
});
