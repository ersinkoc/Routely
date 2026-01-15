import { describe, it, expect } from 'vitest';
import {
  pathToRegex,
  extractParams,
  calculateScore,
  rankRoutes,
  matchRoute,
} from '../src/matcher';
import { route } from '../src/router';

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
});
