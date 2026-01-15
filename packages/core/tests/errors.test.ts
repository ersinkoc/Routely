import { describe, it, expect } from 'vitest';
import {
  RouterError,
  createNotFoundError,
  createGuardError,
  createPluginError,
} from '../src/errors';

describe('RouterError', () => {
  it('should create a router error', () => {
    const error = new RouterError('ROUTE_NOT_FOUND', 'Test error');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(RouterError);
    expect(error.code).toBe('ROUTE_NOT_FOUND');
    expect(error.message).toBe('Test error');
    expect(error.name).toBe('RouterError');
  });

  it('should include route information', () => {
    const route = {
      path: '/test',
      params: {},
      search: {},
      hash: '',
      state: null,
      meta: {},
    };

    const error = new RouterError('GUARD_REJECTED', 'Test error', route);

    expect(error.route).toBe(route);
  });

  it('should include plugin information', () => {
    const error = new RouterError('PLUGIN_ERROR', 'Test error', undefined, 'test-plugin');

    expect(error.plugin).toBe('test-plugin');
  });
});

describe('createNotFoundError', () => {
  it('should create not found error', () => {
    const error = createNotFoundError('/test');

    expect(error.code).toBe('ROUTE_NOT_FOUND');
    expect(error.message).toContain('/test');
  });
});

describe('createGuardError', () => {
  it('should create guard error', () => {
    const route = {
      path: '/test',
      params: {},
      search: {},
      hash: '',
      state: null,
      meta: {},
    };

    const error = createGuardError(route, 'auth-guard');

    expect(error.code).toBe('GUARD_REJECTED');
    expect(error.route).toBe(route);
    expect(error.plugin).toBe('auth-guard');
    expect(error.message).toContain('/test');
  });
});

describe('createPluginError', () => {
  it('should create plugin error', () => {
    const originalError = new Error('Original error');
    const error = createPluginError('test-plugin', originalError);

    expect(error.code).toBe('PLUGIN_ERROR');
    expect(error.plugin).toBe('test-plugin');
    expect(error.message).toContain('test-plugin');
    expect(error.message).toContain('Original error');
  });
});
