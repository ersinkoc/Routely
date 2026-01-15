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
});
