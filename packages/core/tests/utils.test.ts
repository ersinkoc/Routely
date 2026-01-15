import { describe, it, expect } from 'vitest';
import {
  parsePath,
  joinPaths,
  normalizeSlashes,
  parseSearch,
  stringifySearch,
} from '../src/utils';

describe('parsePath', () => {
  it('should parse a simple path', () => {
    const result = parsePath('/users');
    expect(result).toEqual({
      pathname: '/users',
      search: '',
      hash: '',
    });
  });

  it('should parse path with search', () => {
    const result = parsePath('/users?page=1');
    expect(result).toEqual({
      pathname: '/users',
      search: '?page=1',
      hash: '',
    });
  });

  it('should parse path with hash', () => {
    const result = parsePath('/users#section');
    expect(result).toEqual({
      pathname: '/users',
      search: '',
      hash: '#section',
    });
  });

  it('should parse path with both search and hash', () => {
    const result = parsePath('/users?page=1#section');
    expect(result).toEqual({
      pathname: '/users',
      search: '?page=1',
      hash: '#section',
    });
  });
});

describe('joinPaths', () => {
  it('should join two paths', () => {
    expect(joinPaths('/users', 'profile')).toBe('/users/profile');
  });

  it('should handle leading slashes', () => {
    expect(joinPaths('/users', '/profile')).toBe('/users/profile');
  });

  it('should handle trailing slashes', () => {
    expect(joinPaths('/users/', '/profile')).toBe('/users/profile');
  });
});

describe('normalizeSlashes', () => {
  it('should remove multiple slashes', () => {
    expect(normalizeSlashes('//users///profile//')).toBe('/users/profile');
  });

  it('should ensure leading slash', () => {
    expect(normalizeSlashes('users')).toBe('/users');
  });

  it('should preserve root path', () => {
    expect(normalizeSlashes('/')).toBe('/');
  });

  it('should handle wildcard', () => {
    expect(normalizeSlashes('*')).toBe('*');
  });
});

describe('parseSearch', () => {
  it('should parse query string', () => {
    const result = parseSearch('?page=1&sort=asc');
    expect(result).toEqual({ page: '1', sort: 'asc' });
  });

  it('should handle empty string', () => {
    expect(parseSearch('')).toEqual({});
  });

  it('should decode URI components', () => {
    const result = parseSearch('?name=John%20Doe');
    expect(result).toEqual({ name: 'John Doe' });
  });
});

describe('stringifySearch', () => {
  it('should stringify params', () => {
    const result = stringifySearch({ page: '1', sort: 'asc' });
    expect(result).toBe('page=1&sort=asc');
  });

  it('should handle empty object', () => {
    expect(stringifySearch({})).toBe('');
  });

  it('should encode URI components', () => {
    const result = stringifySearch({ name: 'John Doe' });
    expect(result).toBe('name=John%20Doe');
  });
});
