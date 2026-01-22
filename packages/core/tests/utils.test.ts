import { describe, it, expect } from 'vitest';
import {
  parsePath,
  joinPaths,
  normalizeSlashes,
  parseSearch,
  stringifySearch,
  stripBasePath,
  addBasePath,
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

  it('should handle hash before search', () => {
    const result = parsePath('/users#section?page=1');
    expect(result).toEqual({
      pathname: '/users',
      search: '',
      hash: '#section?page=1',
    });
  });

  it('should handle empty path', () => {
    const result = parsePath('');
    expect(result).toEqual({
      pathname: '',
      search: '',
      hash: '',
    });
  });

  it('should handle path with multiple hashes', () => {
    const result = parsePath('/users#first#second');
    expect(result).toEqual({
      pathname: '/users',
      search: '',
      hash: '#first#second',
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

  it('should handle multiple segments', () => {
    expect(joinPaths('/api', 'v1', 'users', '123')).toBe('/api/v1/users/123');
  });

  it('should handle empty segments', () => {
    expect(joinPaths('/users', '', 'profile')).toBe('/users/profile');
  });

  it('should handle all empty segments', () => {
    expect(joinPaths('', '', '')).toBe('');
  });

  it('should handle single segment', () => {
    expect(joinPaths('/users')).toBe('/users');
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

  it('should handle wildcard with leading slash', () => {
    expect(normalizeSlashes('/*')).toBe('/*');
  });

  it('should handle path with trailing slash', () => {
    expect(normalizeSlashes('/users/')).toBe('/users');
  });

  it('should handle path without leading slash', () => {
    expect(normalizeSlashes('users/profile')).toBe('/users/profile');
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

  it('should handle query without leading ?', () => {
    const result = parseSearch('page=1&sort=asc');
    expect(result).toEqual({ page: '1', sort: 'asc' });
  });

  it('should handle query with just ?', () => {
    expect(parseSearch('?')).toEqual({});
  });

  it('should handle params without values', () => {
    const result = parseSearch('?page&sort=asc');
    expect(result).toEqual({ page: '', sort: 'asc' });
  });

  it('should handle multiple same keys as array', () => {
    const result = parseSearch('?page=1&page=2');
    expect(result).toEqual({ page: ['1', '2'] });
  });

  it('should decode special characters', () => {
    const result = parseSearch('?email=test%40example.com');
    expect(result).toEqual({ email: 'test@example.com' });
  });

  it('should handle empty value', () => {
    const result = parseSearch('?key=');
    expect(result).toEqual({ key: '' });
  });

  // Test for empty key handling (line 145)
  it('should skip empty keys in query string', () => {
    const result = parseSearch('?key1=value1&=&key2=value2');
    expect(result).toEqual({ key1: 'value1', key2: 'value2' });
  });

  it('should handle query string with only empty keys', () => {
    const result = parseSearch('?=&=');
    expect(result).toEqual({});
  });

  it('should handle query string starting with &', () => {
    const result = parseSearch('&key=value');
    expect(result).toEqual({ key: 'value' });
  });

  it('should handle query string ending with &', () => {
    const result = parseSearch('key=value&');
    expect(result).toEqual({ key: 'value' });
  });

  it('should handle query string with multiple &&', () => {
    const result = parseSearch('key1=value1&&key2=value2');
    expect(result).toEqual({ key1: 'value1', key2: 'value2' });
  });

  // Test for malformed URI decoding (lines 103-109 coverage)
  it('should handle malformed URI encoding gracefully', () => {
    // Invalid URI encoding should return original value instead of crashing
    const result = parseSearch('?key=%ZZ');
    // decodeURIComponent('%ZZ') would throw, but safeDecodeURIComponent returns original
    expect(result).toEqual({ key: '%ZZ' });
  });

  it('should handle malformed URI component in value', () => {
    const result = parseSearch('?key=value%ZZ%20test');
    expect(result).toEqual({ key: 'value%ZZ%20test' });
  });

  it('should handle partially malformed URI', () => {
    const result = parseSearch('?name=John%20Doe&bad=%ZZ&email=test@example.com');
    expect(result.name).toBe('John Doe');
    expect(result.bad).toBe('%ZZ');
    expect(result.email).toBe('test@example.com');
  });

  // Test for array handling (line 154 coverage)
  it('should convert existing string to array when same key appears again', () => {
    const result = parseSearch('?tags=react&tags=vue');
    expect(result.tags).toEqual(['react', 'vue']);
  });

  it('should append to existing array when same key appears multiple times', () => {
    const result = parseSearch('?tags=react&tags=vue&tags=angular');
    expect(result.tags).toEqual(['react', 'vue', 'angular']);
  });

  it('should handle mix of string and array conversion', () => {
    const result = parseSearch('?color=red&color=blue&size=large');
    expect(result.color).toEqual(['red', 'blue']);
    expect(result.size).toBe('large');
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

  it('should handle special characters', () => {
    const result = stringifySearch({ email: 'test@example.com' });
    expect(result).toBe('email=test%40example.com');
  });

  it('should skip undefined values', () => {
    const result = stringifySearch({ page: '1', sort: undefined });
    expect(result).toBe('page=1');
  });

  it('should skip null values', () => {
    const result = stringifySearch({ page: '1', sort: null as any });
    expect(result).toBe('page=1');
  });

  // Test for array handling (lines 190-194 coverage)
  it('should handle array values', () => {
    const result = stringifySearch({ tags: ['react', 'vue'] });
    expect(result).toBe('tags=react&tags=vue');
  });

  it('should handle array with single element', () => {
    const result = stringifySearch({ tags: ['react'] });
    expect(result).toBe('tags=react');
  });

  it('should handle array with many elements', () => {
    const result = stringifySearch({ ids: ['1', '2', '3', '4', '5'] });
    expect(result).toBe('ids=1&ids=2&ids=3&ids=4&ids=5');
  });

  it('should skip null/undefined items in array', () => {
    const result = stringifySearch({ tags: ['react', null as any, 'vue', undefined] });
    expect(result).toBe('tags=react&tags=vue');
  });

  it('should handle mixed array and string values', () => {
    const result = stringifySearch({ tags: ['react', 'vue'], page: '1' });
    expect(result).toBe('tags=react&tags=vue&page=1');
  });

  it('should encode array items with special characters', () => {
    const result = stringifySearch({ emails: ['test@example.com', 'user@domain.org'] });
    expect(result).toBe('emails=test%40example.com&emails=user%40domain.org');
  });
});

describe('stripBasePath', () => {
  it('should strip base path from pathname', () => {
    const result = stripBasePath('/app/users', '/app');
    expect(result).toBe('/users');
  });

  it('should handle root base path', () => {
    const result = stripBasePath('/users', '/');
    expect(result).toBe('/users');
  });

  it('should handle empty base path', () => {
    const result = stripBasePath('/users', '');
    expect(result).toBe('/users');
  });

  it('should handle pathname without base path', () => {
    const result = stripBasePath('/users', '/app');
    expect(result).toBe('/users');
  });

  it('should return root when stripping leaves empty', () => {
    const result = stripBasePath('/app', '/app');
    expect(result).toBe('/');
  });

  it('should normalize base path before stripping', () => {
    const result = stripBasePath('/app/users', 'app');
    expect(result).toBe('/users');
  });

  it('should handle trailing slash in base path', () => {
    const result = stripBasePath('/app/users', '/app/');
    expect(result).toBe('/users');
  });
});

describe('addBasePath', () => {
  it('should add base path to pathname', () => {
    const result = addBasePath('/users', '/app');
    expect(result).toBe('/app/users');
  });

  it('should handle root base path', () => {
    const result = addBasePath('/users', '/');
    expect(result).toBe('/users');
  });

  it('should handle empty base path', () => {
    const result = addBasePath('/users', '');
    expect(result).toBe('/users');
  });

  it('should handle pathname without leading slash', () => {
    const result = addBasePath('users', '/app');
    expect(result).toBe('/app/users');
  });

  it('should normalize slashes in result', () => {
    const result = addBasePath('/users/', '/app/');
    expect(result).toBe('/app/users');
  });

  it('should handle base path without leading slash', () => {
    const result = addBasePath('/users', 'app');
    expect(result).toBe('/app/users');
  });

  it('should handle complex paths', () => {
    const result = addBasePath('users/profile', '/api/v1');
    expect(result).toBe('/api/v1/users/profile');
  });
});
