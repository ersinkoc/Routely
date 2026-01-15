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

  it('should create a route with children', () => {
    const Component = () => null;
    const Child = () => null;

    const routeDef = route('/users', Component, [
      route(':id', Child),
    ]);

    expect(routeDef.children).toBeDefined();
    expect(routeDef.children).toHaveLength(1);
    expect(routeDef.children![0]!.path).toBe('/:id'); // normalizeSlashes adds /
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

  it('should normalize path', () => {
    const Component = () => null;
    const routeDef = route('users', Component);

    expect(routeDef.path).toBe('/users');
  });

  it('should normalize empty path to root', () => {
    const Component = () => null;
    const routeDef = route('', Component);

    expect(routeDef.path).toBe('/'); // Empty becomes /
  });

  it('should throw error for missing component', () => {
    expect(() => route('/users', null as any)).toThrow();
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

  it('should throw error without history in non-browser environment', () => {
    const Component = () => null;

    // Mock non-browser environment
    const windowBackup = global.window;
    // @ts-ignore
    delete global.window;

    expect(() => {
      createRouter({
        routes: [route('/', Component)],
      });
    }).toThrow();

    // Restore
    global.window = windowBackup;
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
