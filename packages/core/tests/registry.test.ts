import { describe, it, expect } from 'vitest';
import { createRoutes } from '../src/registry';
import type { RouteRegistry } from '../src/registry';

describe('createRoutes', () => {
  it('should create route references from flat registry', () => {
    const registry: RouteRegistry = {
      root: '/',
      users: '/users',
      posts: '/posts',
    };

    const routes = createRoutes(registry);

    expect(routes.root.path).toBe('/');
    expect(routes.users.path).toBe('/users');
    expect(routes.posts.path).toBe('/posts');
  });

  it('should create nested route references', () => {
    const registry: RouteRegistry = {
      users: {
        root: '/users',
        detail: '/users/:id',
      },
    };

    const routes = createRoutes(registry);

    expect(routes.users.root.path).toBe('/users');
    expect(routes.users.detail.path).toBe('/users/:id');
  });

  it('should build parameterized routes', () => {
    const registry: RouteRegistry = {
      user: '/users/:id',
    };

    const routes = createRoutes(registry);

    const built = routes.user.build({ id: '123' });
    expect(built).toBe('/users/123');
  });

  it('should handle deeply nested registry', () => {
    const registry: RouteRegistry = {
      api: {
        v1: {
          users: '/api/v1/users',
        },
      },
    };

    const routes = createRoutes(registry);

    expect(routes.api.v1.users.path).toBe('/api/v1/users');
  });

  it('should convert route ref to string', () => {
    const registry: RouteRegistry = {
      home: '/',
    };

    const routes = createRoutes(registry);

    expect(routes.home.toString()).toBe('/');
  });

  it('should handle empty registry', () => {
    const registry: RouteRegistry = {};

    const routes = createRoutes(registry);

    expect(Object.keys(routes)).toHaveLength(0);
  });

  it('should build routes with multiple params', () => {
    const registry: RouteRegistry = {
      postComment: '/posts/:postId/comments/:commentId',
    };

    const routes = createRoutes(registry);

    const built = routes.postComment.build({ postId: '42', commentId: '7' });
    expect(built).toBe('/posts/42/comments/7');
  });

  it('should handle optional params in build', () => {
    const registry: RouteRegistry = {
      user: '/users/:id',
    };

    const routes = createRoutes(registry);

    // When param is missing, it should preserve the placeholder
    const built = routes.user.build({} as any);
    expect(built).toBe('/users/:id');
  });

  it('should preserve registry structure', () => {
    const registry: RouteRegistry = {
      root: '/',
      users: {
        root: '/users',
        create: '/users/create',
      },
    };

    const routes = createRoutes(registry);

    expect(typeof routes.root.path).toBe('string');
    expect(typeof routes.users.root.path).toBe('string');
    expect(typeof routes.users.create.path).toBe('string');
  });

  it('should return undefined for non-string/non-object properties', () => {
    const registry: RouteRegistry = {
      root: '/',
    };

    const routes = createRoutes(registry);

    // Access a non-existent property - proxy should return undefined
    // @ts-ignore - testing undefined behavior
    expect(routes.nonExistent).toBeUndefined();
  });

  // Prototype pollution prevention tests (lines 82-84)
  it('should throw error when accessing __proto__', () => {
    const registry: RouteRegistry = {
      root: '/',
    };

    const routes = createRoutes(registry);

    expect(() => {
      // @ts-ignore - testing blocked property
      const _ = routes.__proto__;
    }).toThrow('Cannot access blocked property: "__proto__"');
  });

  it('should throw error when accessing constructor', () => {
    const registry: RouteRegistry = {
      root: '/',
    };

    const routes = createRoutes(registry);

    expect(() => {
      // @ts-ignore - testing blocked property
      const _ = routes.constructor;
    }).toThrow('Cannot access blocked property: "constructor"');
  });

  it('should throw error when accessing prototype', () => {
    const registry: RouteRegistry = {
      root: '/',
    };

    const routes = createRoutes(registry);

    expect(() => {
      // @ts-ignore - testing blocked property
      const _ = routes.prototype;
    }).toThrow('Cannot access blocked property: "prototype"');
  });

  it('should throw error when accessing hasOwnProperty', () => {
    const registry: RouteRegistry = {
      root: '/',
    };

    const routes = createRoutes(registry);

    expect(() => {
      // @ts-ignore - testing blocked property
      const _ = routes.hasOwnProperty;
    }).toThrow('Cannot access blocked property: "hasOwnProperty"');
  });

  it('should throw error when accessing toString', () => {
    const registry: RouteRegistry = {
      root: '/',
    };

    const routes = createRoutes(registry);

    expect(() => {
      // @ts-ignore - testing blocked property
      const _ = routes.toString;
    }).toThrow('Cannot access blocked property: "toString"');
  });

  it('should throw error when accessing toLocaleString', () => {
    const registry: RouteRegistry = {
      root: '/',
    };

    const routes = createRoutes(registry);

    expect(() => {
      // @ts-ignore - testing blocked property
      const _ = routes.toLocaleString;
    }).toThrow('Cannot access blocked property: "toLocaleString"');
  });

  it('should throw error when accessing valueOf', () => {
    const registry: RouteRegistry = {
      root: '/',
    };

    const routes = createRoutes(registry);

    expect(() => {
      // @ts-ignore - testing blocked property
      const _ = routes.valueOf;
    }).toThrow('Cannot access blocked property: "valueOf"');
  });

  it('should throw error when accessing isPrototypeOf', () => {
    const registry: RouteRegistry = {
      root: '/',
    };

    const routes = createRoutes(registry);

    expect(() => {
      // @ts-ignore - testing blocked property
      const _ = routes.isPrototypeOf;
    }).toThrow('Cannot access blocked property: "isPrototypeOf"');
  });

  it('should throw error when accessing propertyIsEnumerable', () => {
    const registry: RouteRegistry = {
      root: '/',
    };

    const routes = createRoutes(registry);

    expect(() => {
      // @ts-ignore - testing blocked property
      const _ = routes.propertyIsEnumerable;
    }).toThrow('Cannot access blocked property: "propertyIsEnumerable"');
  });

  // Symbol access test (lines 87-89)
  it('should return undefined for symbol access', () => {
    const registry: RouteRegistry = {
      root: '/',
    };

    const routes = createRoutes(registry);

    const sym = Symbol('test');
    // @ts-ignore - testing symbol access
    expect(routes[sym]).toBeUndefined();
  });

  it('should return undefined for well-known symbols', () => {
    const registry: RouteRegistry = {
      root: '/',
    };

    const routes = createRoutes(registry);

    // @ts-ignore - testing symbol access
    expect(routes[Symbol.iterator]).toBeUndefined();
    // @ts-ignore - testing symbol access
    expect(routes[Symbol.toStringTag]).toBeUndefined();
  });
});
