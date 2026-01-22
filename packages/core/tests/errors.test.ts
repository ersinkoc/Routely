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

  it('should have correct stack trace', () => {
    const error = new RouterError('ROUTE_NOT_FOUND', 'Test error');

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('RouterError');
  });
});

describe('createNotFoundError', () => {
  it('should create not found error with valid path', () => {
    const error = createNotFoundError('/test');

    expect(error.code).toBe('ROUTE_NOT_FOUND');
    expect(error.message).toContain('/test');
    expect(error.message).toContain('No route found for path:');
  });

  it('should handle null path', () => {
    const error = createNotFoundError(null as any);

    expect(error.code).toBe('ROUTE_NOT_FOUND');
    expect(error.message).toContain('(null or undefined)');
  });

  it('should handle undefined path', () => {
    const error = createNotFoundError(undefined as any);

    expect(error.code).toBe('ROUTE_NOT_FOUND');
    expect(error.message).toContain('(null or undefined)');
  });

  it('should sanitize path with null bytes', () => {
    const error = createNotFoundError('/test\0malicious');

    expect(error.code).toBe('ROUTE_NOT_FOUND');
    expect(error.message).not.toContain('\0');
    expect(error.message).toContain('/testmalicious');
  });

  it('should sanitize path with control characters', () => {
    const error = createNotFoundError('/test\x00\x01\x02');

    expect(error.code).toBe('ROUTE_NOT_FOUND');
    expect(error.message).not.toContain('\x00');
    expect(error.message).not.toContain('\x01');
  });

  it('should truncate long paths', () => {
    const longPath = '/test/' + 'a'.repeat(300);
    const error = createNotFoundError(longPath);

    expect(error.code).toBe('ROUTE_NOT_FOUND');
    // Should be truncated to MAX_ERROR_PATH_LENGTH
    expect(error.message.length).toBeLessThan(longPath.length + 50);
  });

  it('should handle numeric path (convert to string)', () => {
    const error = createNotFoundError(123 as any);

    expect(error.code).toBe('ROUTE_NOT_FOUND');
    expect(error.message).toContain('123');
  });

  it('should handle object path (convert to string)', () => {
    const error = createNotFoundError({ toString: () => '/custom' } as any);

    expect(error.code).toBe('ROUTE_NOT_FOUND');
    expect(error.message).toContain('/custom');
  });

  it('should handle empty string path', () => {
    const error = createNotFoundError('');

    expect(error.code).toBe('ROUTE_NOT_FOUND');
    expect(error.message).toContain('No route found for path:');
  });

  it('should handle special characters in path', () => {
    const error = createNotFoundError('/path/with spaces/and-dashes');

    expect(error.code).toBe('ROUTE_NOT_FOUND');
    expect(error.message).toContain('/path/with spaces/and-dashes');
  });
});

describe('createGuardError', () => {
  const mockRoute = {
    path: '/test',
    params: {},
    search: {},
    hash: '',
    state: null,
    meta: {},
  };

  it('should create guard error with valid route and plugin', () => {
    const error = createGuardError(mockRoute, 'auth-guard');

    expect(error.code).toBe('GUARD_REJECTED');
    expect(error.route).toBe(mockRoute);
    expect(error.plugin).toBe('auth-guard');
    expect(error.message).toContain('/test');
  });

  it('should handle null route', () => {
    const error = createGuardError(null as any, 'auth-guard');

    expect(error.code).toBe('GUARD_REJECTED');
    expect(error.message).toContain('Navigation was rejected by guard');
    expect(error.route).toBeUndefined();
    expect(error.plugin).toBe('auth-guard');
  });

  it('should handle undefined route', () => {
    const error = createGuardError(undefined as any, 'auth-guard');

    expect(error.code).toBe('GUARD_REJECTED');
    expect(error.message).toContain('Navigation was rejected by guard');
    expect(error.route).toBeUndefined();
  });

  it('should handle non-object route', () => {
    const error = createGuardError('not-an-object' as any, 'auth-guard');

    expect(error.code).toBe('GUARD_REJECTED');
    expect(error.message).toContain('Navigation was rejected by guard');
    expect(error.route).toBeUndefined();
  });

  it('should handle array as route', () => {
    const error = createGuardError([] as any, 'auth-guard');

    expect(error.code).toBe('GUARD_REJECTED');
    // Arrays are objects, so they pass the typeof check
    // But they don't have a path property, so it becomes '(unknown)'
    expect(error.message).toContain('Navigation to (unknown) was rejected by guard');
    // The route is passed through as-is (the array)
    expect(error.route).toEqual([]);
  });

  it('should handle numeric route', () => {
    const error = createGuardError(123 as any, 'auth-guard');

    expect(error.code).toBe('GUARD_REJECTED');
    expect(error.message).toContain('Navigation was rejected by guard');
    expect(error.route).toBeUndefined();
  });

  it('should handle null plugin name', () => {
    const error = createGuardError(mockRoute, null as any);

    expect(error.code).toBe('GUARD_REJECTED');
    // When route is valid but plugin is invalid, plugin is set to '(unknown)'
    expect(error.plugin).toBe('(unknown)');
    expect(error.message).toContain('/test');
  });

  it('should handle undefined plugin name', () => {
    const error = createGuardError(mockRoute, undefined as any);

    expect(error.code).toBe('GUARD_REJECTED');
    expect(error.plugin).toBe('(unknown)');
  });

  it('should handle numeric plugin name', () => {
    const error = createGuardError(mockRoute, 123 as any);

    expect(error.code).toBe('GUARD_REJECTED');
    expect(error.plugin).toBe('(unknown)');
  });

  it('should sanitize plugin name with null bytes', () => {
    const error = createGuardError(mockRoute, 'auth\0guard');

    expect(error.code).toBe('GUARD_REJECTED');
    expect(error.plugin).not.toContain('\0');
    expect(error.plugin).toBe('authguard');
    // Note: message doesn't include plugin name, just the sanitized path
    expect(error.message).toContain('/test');
  });

  it('should sanitize plugin name with control characters', () => {
    const error = createGuardError(mockRoute, 'auth\x00guard');

    expect(error.code).toBe('GUARD_REJECTED');
    expect(error.plugin).not.toContain('\x00');
  });

  it('should truncate long plugin names', () => {
    const longPlugin = 'a'.repeat(200);
    const error = createGuardError(mockRoute, longPlugin);

    expect(error.code).toBe('GUARD_REJECTED');
    expect(error.plugin?.length).toBeLessThanOrEqual(100);
  });

  it('should sanitize route path with null bytes', () => {
    const routeWithNullByte = { ...mockRoute, path: '/test\0path' };
    const error = createGuardError(routeWithNullByte, 'auth-guard');

    expect(error.code).toBe('GUARD_REJECTED');
    expect(error.message).not.toContain('\0');
    expect(error.message).toContain('/testpath');
  });

  it('should handle route without path property', () => {
    const routeWithoutPath = { ...mockRoute, path: undefined as any };
    const error = createGuardError(routeWithoutPath, 'auth-guard');

    expect(error.code).toBe('GUARD_REJECTED');
    expect(error.message).toContain('(unknown)');
  });

  it('should handle route with empty path', () => {
    const routeWithEmptyPath = { ...mockRoute, path: '' };
    const error = createGuardError(routeWithEmptyPath, 'auth-guard');

    expect(error.code).toBe('GUARD_REJECTED');
    expect(error.message).toContain('');
  });
});

describe('createPluginError', () => {
  it('should create plugin error with valid inputs', () => {
    const originalError = new Error('Original error');
    const error = createPluginError('test-plugin', originalError);

    expect(error.code).toBe('PLUGIN_ERROR');
    expect(error.plugin).toBe('test-plugin');
    expect(error.message).toContain('test-plugin');
    expect(error.message).toContain('Original error');
  });

  it('should handle null plugin name', () => {
    const originalError = new Error('Original error');
    const error = createPluginError(null as any, originalError);

    expect(error.code).toBe('PLUGIN_ERROR');
    expect(error.plugin).toBe('(unknown)');
    // When plugin is invalid, message format is "Plugin threw an error: ..."
    // (doesn't include "(unknown)" in the message, only in the plugin property)
    expect(error.message).toContain('Plugin threw an error');
    expect(error.message).toContain('Original error');
  });

  it('should handle undefined plugin name', () => {
    const originalError = new Error('Original error');
    const error = createPluginError(undefined as any, originalError);

    expect(error.code).toBe('PLUGIN_ERROR');
    expect(error.plugin).toBe('(unknown)');
  });

  it('should handle numeric plugin name', () => {
    const originalError = new Error('Original error');
    const error = createPluginError(123 as any, originalError);

    expect(error.code).toBe('PLUGIN_ERROR');
    expect(error.plugin).toBe('(unknown)');
  });

  it('should handle null original error', () => {
    const error = createPluginError('test-plugin', null as any);

    expect(error.code).toBe('PLUGIN_ERROR');
    expect(error.message).toContain('Unknown error');
  });

  it('should handle undefined original error', () => {
    const error = createPluginError('test-plugin', undefined as any);

    expect(error.code).toBe('PLUGIN_ERROR');
    expect(error.message).toContain('Unknown error');
  });

  it('should handle non-Error original error', () => {
    const error = createPluginError('test-plugin', 'string error' as any);

    expect(error.code).toBe('PLUGIN_ERROR');
    // For non-Error objects, the code tries to get message property
    // If no message property exists, it defaults to "Unknown error"
    expect(error.message).toContain('test-plugin');
  });

  it('should handle original error without message', () => {
    const errorWithoutMessage = { name: 'Error' } as any;
    const error = createPluginError('test-plugin', errorWithoutMessage);

    expect(error.code).toBe('PLUGIN_ERROR');
    expect(error.message).toContain('Unknown error');
  });

  it('should sanitize plugin name with null bytes', () => {
    const originalError = new Error('Test error');
    const error = createPluginError('test\0plugin', originalError);

    expect(error.code).toBe('PLUGIN_ERROR');
    expect(error.plugin).not.toContain('\0');
    expect(error.message).not.toContain('\0');
  });

  it('should sanitize plugin name with control characters', () => {
    const originalError = new Error('Test error');
    const error = createPluginError('test\x00plugin', originalError);

    expect(error.code).toBe('PLUGIN_ERROR');
    expect(error.plugin).not.toContain('\x00');
  });

  it('should truncate long plugin names', () => {
    const originalError = new Error('Test error');
    const longPlugin = 'a'.repeat(200);
    const error = createPluginError(longPlugin, originalError);

    expect(error.code).toBe('PLUGIN_ERROR');
    expect(error.plugin?.length).toBeLessThanOrEqual(100);
  });

  it('should sanitize error message with null bytes', () => {
    const errorWithNull = new Error('Error\0message');
    const error = createPluginError('test-plugin', errorWithNull);

    expect(error.code).toBe('PLUGIN_ERROR');
    expect(error.message).not.toContain('\0');
  });

  it('should sanitize error message with control characters', () => {
    const errorWithControl = new Error('Error\x00message');
    const error = createPluginError('test-plugin', errorWithControl);

    expect(error.code).toBe('PLUGIN_ERROR');
    expect(error.message).not.toContain('\x00');
  });

  it('should truncate long error messages', () => {
    const longMessage = 'a'.repeat(1000);
    const longError = new Error(longMessage);
    const error = createPluginError('test-plugin', longError);

    expect(error.code).toBe('PLUGIN_ERROR');
    // Error message should be truncated
    expect(error.message.length).toBeLessThan(1000);
  });

  it('should handle error with very long message', () => {
    const veryLongMessage = 'x'.repeat(10000);
    const veryLongError = new Error(veryLongMessage);
    const error = createPluginError('test-plugin', veryLongError);

    expect(error.code).toBe('PLUGIN_ERROR');
    // The full message includes "Plugin \"test-plugin\" threw an error: " prefix (38 chars)
    // plus the sanitized error message (truncated to MAX_ERROR_MESSAGE_LENGTH = 500)
    // So total should be around 538 characters
    expect(error.message.length).toBeGreaterThan(500);
    expect(error.message.length).toBeLessThan(600);
  });
});
