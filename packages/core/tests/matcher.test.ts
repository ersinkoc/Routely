import { describe, it, expect } from 'vitest';
import {
  pathToRegex,
  extractParams,
  calculateScore,
  rankRoutes,
  matchRoute,
  RouteMatcher,
} from '../src/matcher';
import { route } from '../src/router';
import type { RouteDefinition } from '../src/types';

describe('pathToRegex', () => {
  it('should convert static path to regex', () => {
    const regex = pathToRegex('/users');
    expect(regex.test('/users')).toBe(true);
    expect(regex.test('/users/123')).toBe(false);
  });

  it('should convert dynamic path to regex', () => {
    const regex = pathToRegex('/users/:id');
    expect(regex.test('/users/123')).toBe(true);
    expect(regex.test('/users')).toBe(false);
  });

  it('should handle wildcards', () => {
    const regex = pathToRegex('/blog/*');
    expect(regex.test('/blog/post')).toBe(true);
    expect(regex.test('/blog/2024/post')).toBe(true);
  });

  it('should handle * wildcard', () => {
    const regex = pathToRegex('*');
    expect(regex.test('/')).toBe(true);
    expect(regex.test('/users')).toBe(true);
    expect(regex.test('/users/123')).toBe(true);
    expect(regex.test('')).toBe(false);
  });

  it('should handle /* wildcard', () => {
    const regex = pathToRegex('/*');
    expect(regex.test('/')).toBe(true);
    expect(regex.test('/users')).toBe(true);
    expect(regex.test('/users/123')).toBe(true);
  });

  it('should handle special regex characters', () => {
    const regex = pathToRegex('/users/profile.com');
    expect(regex.test('/users/profile.com')).toBe(true);
    expect(regex.test('/users/profileXcom')).toBe(false);
  });
});

describe('extractParams', () => {
  it('should extract single param', () => {
    const params = extractParams('/users/123', '/users/:id');
    expect(params).toEqual({ id: '123' });
  });

  it('should extract multiple params', () => {
    const params = extractParams('/users/123/posts/456', '/users/:id/posts/:postId');
    expect(params).toEqual({ id: '123', postId: '456' });
  });

  it('should return empty for static routes', () => {
    const params = extractParams('/users', '/users');
    expect(params).toEqual({});
  });

  it('should decode URI encoded params', () => {
    const params = extractParams('/users/hello%20world', '/users/:name');
    expect(params).toEqual({ name: 'hello world' });
  });

  it('should return empty when URL does not match pattern', () => {
    const params = extractParams('/posts/123', '/users/:id');
    expect(params).toEqual({});
  });

  it('should handle wildcard routes', () => {
    const params = extractParams('/blog/2024/post', '/blog/*');
    // Wildcards don't extract params by default
    expect(params).toEqual({});
  });
});

describe('calculateScore', () => {
  it('should score static segments highest', () => {
    expect(calculateScore('/users/profile')).toBe(2000);
  });

  it('should score dynamic segments lower', () => {
    expect(calculateScore('/users/:id')).toBe(1100);
  });

  it('should score wildcards lowest', () => {
    expect(calculateScore('/*')).toBe(1);
  });

  it('should score mixed routes correctly', () => {
    expect(calculateScore('/users/:id/posts/:postId')).toBe(2200);
    expect(calculateScore('/users/:id/posts/edit')).toBe(3100); // 3 static (users, posts, edit) + 1 dynamic (:id) = 3100
  });

  it('should score root path', () => {
    expect(calculateScore('/')).toBe(0);
  });

  it('should score * wildcard', () => {
    expect(calculateScore('*')).toBe(1);
  });
});

describe('rankRoutes', () => {
  it('should rank routes by specificity', () => {
    const routes = [
      route('*', () => null),
      route('/users/:id', () => null),
      route('/users/profile', () => null),
    ];

    const ranked = rankRoutes(routes);

    expect(ranked[0]!.path).toBe('/users/profile');
    expect(ranked[1]!.path).toBe('/users/:id');
    expect(ranked[2]!.path).toBe('*');
  });
});

describe('matchRoute', () => {
  it('should match static route', () => {
    const routes = [route('/users', () => null)];
    const match = matchRoute('/users', routes);

    expect(match).toBeDefined();
    expect(match?.route.path).toBe('/users');
  });

  it('should match dynamic route', () => {
    const routes = [route('/users/:id', () => null)];
    const match = matchRoute('/users/123', routes);

    expect(match).toBeDefined();
    expect(match?.params).toEqual({ id: '123' });
  });

  it('should return null for no match', () => {
    const routes = [route('/users', () => null)];
    const match = matchRoute('/posts', routes);

    expect(match).toBeNull();
  });

  it('should match most specific route', () => {
    const routes = [
      route('/users/:id', () => null),
      route('/users/profile', () => null),
    ];

    const match = matchRoute('/users/profile', routes);

    expect(match?.route.path).toBe('/users/profile');
  });

  it('should handle wildcard routes', () => {
    const routes = [route('*', () => null)];
    const match = matchRoute('/anything/here', routes);

    expect(match).toBeDefined();
    expect(match?.route.path).toBe('*');
  });

  it('should handle /* wildcard routes', () => {
    const routes = [route('/*', () => null)];
    const match = matchRoute('/anything/here', routes);

    expect(match).toBeDefined();
    expect(match?.route.path).toBe('/*');
  });
});

describe('RouteMatcher', () => {
  it('should cache match results', () => {
    const routes = [route('/users/:id', () => null)];
    const matcher = new RouteMatcher();

    const match1 = matcher.match('/users/123', routes);
    const match2 = matcher.match('/users/123', routes);

    expect(match1).toEqual(match2);
    expect(match1?.params).toEqual({ id: '123' });
  });

  it('should return cached result for same URL', () => {
    const routes = [route('/users/:id', () => null)];
    const matcher = new RouteMatcher();

    matcher.match('/users/123', routes);

    // Second call should use cache
    const match = matcher.match('/users/123', routes);

    expect(match).toBeDefined();
    expect(match?.params).toEqual({ id: '123' });
  });

  it('should cache null for no match', () => {
    const routes = [route('/users', () => null)];
    const matcher = new RouteMatcher();

    const match1 = matcher.match('/posts', routes);
    const match2 = matcher.match('/posts', routes);

    expect(match1).toBeNull();
    expect(match2).toBeNull();
  });

  it('should clear cache', () => {
    const routes = [route('/users/:id', () => null)];
    const matcher = new RouteMatcher();

    matcher.match('/users/123', routes);
    matcher.clearCache();

    // After clearing, should re-match (not cached)
    const match = matcher.match('/users/456', routes);

    expect(match?.params).toEqual({ id: '456' });
  });

  it('should handle different routes separately', () => {
    const routes = [route('/users/:id', () => null), route('/posts/:id', () => null)];
    const matcher = new RouteMatcher();

    const userMatch = matcher.match('/users/123', routes);
    const postMatch = matcher.match('/posts/456', routes);

    expect(userMatch?.route.path).toBe('/users/:id');
    expect(postMatch?.route.path).toBe('/posts/:id');
  });

  it('should handle empty routes array', () => {
    const routes: RouteDefinition[] = [];
    const matcher = new RouteMatcher();

    const match = matcher.match('/users', routes);

    expect(match).toBeNull();
  });

  // Test for LRU cache eviction (lines 209-213)
  it('should evict least recently used entry when cache is full', () => {
    const routes = [route('/users/:id', () => null)];
    // Create matcher with very small cache size
    const matcher = new RouteMatcher(2);

    matcher.match('/users/1', routes);
    matcher.match('/users/2', routes);
    // Now cache is full with 2 entries

    // Access first entry to mark it as recently used
    matcher.match('/users/1', routes);

    // Add third entry - should evict /users/2 (least recently used)
    matcher.match('/users/3', routes);

    // /users/1 should still be in cache
    expect(matcher.getCacheSize()).toBe(2);
  });

  it('should evict oldest entry when cache is full without re-access', () => {
    const routes = [route('/users/:id', () => null)];
    const matcher = new RouteMatcher(2);

    matcher.match('/users/1', routes);
    matcher.match('/users/2', routes);
    // Cache is full: [/users/1, /users/2] where /users/2 is most recent

    // Add third entry - should evict /users/1 (least recently used)
    matcher.match('/users/3', routes);

    // Cache should now contain [/users/3, /users/2]
    expect(matcher.getCacheSize()).toBe(2);
  });

  // Test for getCacheSize (lines 227-228)
  it('should return correct cache size', () => {
    const routes = [route('/users/:id', () => null)];
    const matcher = new RouteMatcher(10);

    expect(matcher.getCacheSize()).toBe(0);

    matcher.match('/users/1', routes);
    expect(matcher.getCacheSize()).toBe(1);

    matcher.match('/users/2', routes);
    expect(matcher.getCacheSize()).toBe(2);

    matcher.match('/users/1', routes); // Re-access - shouldn't increase size
    expect(matcher.getCacheSize()).toBe(2);

    matcher.clearCache();
    expect(matcher.getCacheSize()).toBe(0);
  });

  // Test for wildcard segment scoring (lines 119-122)
  it('should score segments with wildcards correctly', () => {
    // Test segment like :path* which should get OPTIONAL_PARAMETER score
    expect(calculateScore('/files/:path*')).toBe(1050); // /files (static) + :path* (optional param)
  });

  it('should score optional parameters correctly', () => {
    expect(calculateScore('/users/:id?')).toBe(1050); // /users (static) + :id? (optional)
  });

  it('should score routes with only optional parameters', () => {
    expect(calculateScore('/:id?')).toBe(50); // Just optional param
  });
});
