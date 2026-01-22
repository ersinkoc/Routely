import { describe, it, expect, vi } from 'vitest';
import { RouterKernel } from '../src/kernel';
import { createMemoryHistory } from '../src/history';
import type { RouteDefinition, RouterPlugin } from '../src/types';

describe('RouterKernel', () => {
  const createTestRoute = (path: string): RouteDefinition => ({
    path,
    component: () => null,
  });

  describe('Plugin System', () => {
    it('should register a plugin', () => {
      const history = createMemoryHistory();
      const kernel = new RouterKernel([createTestRoute('/')], history);

      const plugin: RouterPlugin = {
        name: 'test-plugin',
        install: vi.fn(),
      };

      kernel.use(plugin);

      expect(kernel.list()).toContain('test-plugin');
      expect(plugin.install).toHaveBeenCalledWith(kernel);
    });

    it('should call plugin onInit after installation', () => {
      const history = createMemoryHistory();
      const kernel = new RouterKernel([createTestRoute('/')], history);

      const onInit = vi.fn();
      const plugin: RouterPlugin = {
        name: 'test-plugin',
        install: vi.fn(),
        onInit,
      };

      kernel.use(plugin);

      expect(onInit).toHaveBeenCalled();
    });

    it('should provide access to history through getter', () => {
      const history = createMemoryHistory();
      const kernel = new RouterKernel([createTestRoute('/')], history);

      // Access the history getter to cover lines 71-72
      expect(kernel.history).toBe(history);
    });

    it('should provide access to routes through getter', () => {
      const history = createMemoryHistory();
      const routes = [createTestRoute('/'), createTestRoute('/users')];
      const kernel = new RouterKernel(routes, history);

      // Access the routes getter
      expect(kernel.routes).toEqual(routes);
    });

    it('should throw error when registering duplicate plugin', () => {
      const history = createMemoryHistory();
      const kernel = new RouterKernel([createTestRoute('/')], history);

      const plugin: RouterPlugin = {
        name: 'test-plugin',
        install: vi.fn(),
      };

      kernel.use(plugin);

      expect(() => kernel.use(plugin)).toThrow('Plugin "test-plugin" is already registered');
    });

    it('should check plugin dependencies', () => {
      const history = createMemoryHistory();
      const kernel = new RouterKernel([createTestRoute('/')], history);

      const plugin: RouterPlugin = {
        name: 'dependent-plugin',
        install: vi.fn(),
        dependencies: ['missing-plugin'],
      };

      expect(() => kernel.use(plugin)).toThrow(
        'Plugin "dependent-plugin" depends on "missing-plugin" which is not registered'
      );
    });

    it('should register plugin when all dependencies are satisfied', () => {
      const history = createMemoryHistory();
      const kernel = new RouterKernel([createTestRoute('/')], history);

      // Register the dependency first
      const basePlugin: RouterPlugin = {
        name: 'base-plugin',
        install: vi.fn(),
      };
      kernel.use(basePlugin);

      // Now register a plugin that depends on base-plugin
      const dependentPlugin: RouterPlugin = {
        name: 'dependent-plugin',
        install: vi.fn(),
        dependencies: ['base-plugin'],
      };

      kernel.use(dependentPlugin);

      expect(kernel.list()).toContain('dependent-plugin');
      expect(dependentPlugin.install).toHaveBeenCalled();
    });

    it('should unregister a plugin', () => {
      const history = createMemoryHistory();
      const kernel = new RouterKernel([createTestRoute('/')], history);

      const onDestroy = vi.fn();
      const plugin: RouterPlugin = {
        name: 'test-plugin',
        install: vi.fn(),
        onDestroy,
      };

      kernel.use(plugin);
      expect(kernel.list()).toContain('test-plugin');

      kernel.unregister('test-plugin');
      expect(kernel.list()).not.toContain('test-plugin');
      expect(onDestroy).toHaveBeenCalled();
    });

    it('should handle unregistering non-existent plugin', () => {
      const history = createMemoryHistory();
      const kernel = new RouterKernel([createTestRoute('/')], history);

      expect(() => kernel.unregister('non-existent')).not.toThrow();
    });

    it('should emit error event on plugin installation failure', () => {
      const history = createMemoryHistory();
      const kernel = new RouterKernel([createTestRoute('/')], history);

      const errorHandler = vi.fn();
      kernel.on('error', errorHandler);

      const plugin: RouterPlugin = {
        name: 'failing-plugin',
        install: () => {
          throw new Error('Installation failed');
        },
      };

      // Plugin now throws on installation failure
      expect(() => kernel.use(plugin)).toThrow();

      // Error should still be emitted
      expect(errorHandler).toHaveBeenCalled();
    });

    it('should call plugin onError on installation failure', () => {
      const history = createMemoryHistory();
      const kernel = new RouterKernel([createTestRoute('/')], history);

      const onError = vi.fn();
      const plugin: RouterPlugin = {
        name: 'failing-plugin',
        install: () => {
          throw new Error('Installation failed');
        },
        onError,
      };

      // Plugin now throws on installation failure
      expect(() => kernel.use(plugin)).toThrow();

      // Plugin's onError should still be called
      expect(onError).toHaveBeenCalled();
    });

    it('should handle plugin throwing non-Error value', () => {
      const history = createMemoryHistory();
      const kernel = new RouterKernel([createTestRoute('/')], history);

      const errorHandler = vi.fn();
      kernel.on('error', errorHandler);

      const plugin: RouterPlugin = {
        name: 'failing-plugin',
        install: () => {
          throw 'String error'; // Not an Error object
        },
      };

      // Plugin now throws on installation failure
      expect(() => kernel.use(plugin)).toThrow();

      expect(errorHandler).toHaveBeenCalled();
      const errorArg = errorHandler.mock.calls[0][0];
      expect(errorArg).toBeInstanceOf(Error);
      expect(errorArg.message).toContain('String error');
    });
  });

  describe('Event System', () => {
    it('should add and remove event listeners', async () => {
      const history = createMemoryHistory({ initialEntries: ['/'] });
      const kernel = new RouterKernel([createTestRoute('/'), createTestRoute('/users')], history);

      // Wait for constructor to complete (uses queueMicrotask)
      await new Promise(resolve => setImmediate(resolve));

      const handler = vi.fn();
      const unsubscribe = kernel.on('afterNavigate', handler);

      await kernel.navigate('/users');

      // Wait for async operations (queueMicrotask + navigation)
      await new Promise(resolve => setImmediate(resolve));
      await new Promise(resolve => setImmediate(resolve));

      expect(handler).toHaveBeenCalled();

      handler.mockClear();
      unsubscribe();
      await kernel.navigate('/');
      await new Promise(resolve => setImmediate(resolve));
      await new Promise(resolve => setImmediate(resolve));
      expect(handler).not.toHaveBeenCalled();
    });

    it('should manually remove event listener with off', async () => {
      const history = createMemoryHistory();
      const kernel = new RouterKernel([createTestRoute('/')], history);

      // Wait for constructor to complete
      await new Promise(resolve => setImmediate(resolve));

      const handler = vi.fn();
      kernel.on('afterNavigate', handler);

      kernel.off('afterNavigate', handler);
      await kernel.navigate('/');

      // Wait for async operations
      await new Promise(resolve => setImmediate(resolve));

      expect(handler).not.toHaveBeenCalled();
    });

    it('should emit beforeNavigate event', async () => {
      const history = createMemoryHistory();
      const kernel = new RouterKernel(
        [createTestRoute('/'), createTestRoute('/users')],
        history
      );

      // Wait for constructor to complete
      await new Promise(resolve => setImmediate(resolve));

      const beforeHandler = vi.fn();
      kernel.on('beforeNavigate', beforeHandler);

      await kernel.navigate('/users');

      expect(beforeHandler).toHaveBeenCalled();
    });

    it('should cancel navigation when beforeNavigate returns false', async () => {
      const history = createMemoryHistory();
      const kernel = new RouterKernel(
        [createTestRoute('/'), createTestRoute('/users')],
        history
      );

      // Wait for constructor to complete
      await new Promise(resolve => setImmediate(resolve));

      kernel.on('beforeNavigate', () => false);

      const initialRoute = kernel.currentRoute;
      await kernel.navigate('/users');

      expect(kernel.currentRoute).toBe(initialRoute);
    });

    it('should call plugin onBeforeNavigate', async () => {
      const history = createMemoryHistory();
      const kernel = new RouterKernel(
        [createTestRoute('/'), createTestRoute('/users')],
        history
      );

      // Wait for constructor to complete
      await new Promise(resolve => setImmediate(resolve));

      const onBeforeNavigate = vi.fn(() => true);
      const plugin: RouterPlugin = {
        name: 'guard-plugin',
        install: vi.fn(),
        onBeforeNavigate,
      };

      kernel.use(plugin);
      await kernel.navigate('/users');

      expect(onBeforeNavigate).toHaveBeenCalled();
    });

    it('should cancel navigation when plugin onBeforeNavigate returns false', async () => {
      const history = createMemoryHistory();
      const kernel = new RouterKernel(
        [createTestRoute('/'), createTestRoute('/users')],
        history
      );

      // Wait for constructor to complete
      await new Promise(resolve => setImmediate(resolve));

      const plugin: RouterPlugin = {
        name: 'guard-plugin',
        install: vi.fn(),
        onBeforeNavigate: () => false,
      };

      kernel.use(plugin);
      const initialRoute = kernel.currentRoute;
      await kernel.navigate('/users');

      expect(kernel.currentRoute).toBe(initialRoute);
    });

    it('should handle error in beforeNavigate handler', async () => {
      const history = createMemoryHistory();
      const kernel = new RouterKernel(
        [createTestRoute('/'), createTestRoute('/users')],
        history
      );

      // Wait for constructor to complete
      await new Promise(resolve => setImmediate(resolve));

      kernel.on('beforeNavigate', () => {
        throw new Error('Handler error');
      });

      const initialRoute = kernel.currentRoute;
      await kernel.navigate('/users');

      // Navigation should be cancelled
      expect(kernel.currentRoute).toBe(initialRoute);
    });

    it('should handle error in plugin onBeforeNavigate', async () => {
      const history = createMemoryHistory();
      const kernel = new RouterKernel(
        [createTestRoute('/'), createTestRoute('/users')],
        history
      );

      // Wait for constructor to complete
      await new Promise(resolve => setImmediate(resolve));

      const onError = vi.fn();
      const plugin: RouterPlugin = {
        name: 'guard-plugin',
        install: vi.fn(),
        onBeforeNavigate: () => {
          throw new Error('Plugin error');
        },
        onError,
      };

      kernel.use(plugin);
      const initialRoute = kernel.currentRoute;
      await kernel.navigate('/users');

      expect(kernel.currentRoute).toBe(initialRoute);
      expect(onError).toHaveBeenCalled();
    });

    it('should handle plugin onBeforeNavigate throwing non-Error value', async () => {
      const history = createMemoryHistory();
      const kernel = new RouterKernel(
        [createTestRoute('/'), createTestRoute('/users')],
        history
      );

      // Wait for constructor to complete
      await new Promise(resolve => setImmediate(resolve));

      const onError = vi.fn();
      const plugin: RouterPlugin = {
        name: 'guard-plugin',
        install: vi.fn(),
        onBeforeNavigate: () => {
          throw 'String error in onBeforeNavigate'; // Not an Error object
        },
        onError,
      };

      kernel.use(plugin);
      const initialRoute = kernel.currentRoute;
      await kernel.navigate('/users');

      expect(kernel.currentRoute).toBe(initialRoute);
      expect(onError).toHaveBeenCalled();
      const errorArg = onError.mock.calls[0][0];
      expect(errorArg).toBeInstanceOf(Error);
      expect(errorArg.message).toContain('String error in onBeforeNavigate');
    });

    it('should emit error event when no route matches', async () => {
      const history = createMemoryHistory();
      const kernel = new RouterKernel([createTestRoute('/')], history);

      // Wait for constructor to complete
      await new Promise(resolve => setImmediate(resolve));

      const errorHandler = vi.fn();
      kernel.on('error', errorHandler);

      await kernel.navigate('/nonexistent');

      expect(errorHandler).toHaveBeenCalled();
      const error = errorHandler.mock.calls[0][0];
      expect(error.code).toBe('ROUTE_NOT_FOUND');
    });

    it('should handle error in afterNavigate handler gracefully', async () => {
      const history = createMemoryHistory({ initialEntries: ['/'] });
      const kernel = new RouterKernel(
        [createTestRoute('/'), createTestRoute('/users')],
        history
      );

      // Wait for constructor to complete
      await new Promise(resolve => setImmediate(resolve));

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      kernel.on('afterNavigate', () => {
        throw new Error('Handler error');
      });

      // Navigation should still complete despite the error in handler
      await kernel.navigate('/users');
      // Wait for async operations (queueMicrotask + navigation)
      await new Promise(resolve => setImmediate(resolve));
      await new Promise(resolve => setImmediate(resolve));

      expect(kernel.currentRoute?.path).toBe('/users');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error in afterNavigate handler:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Navigation', () => {
    it('should navigate with replace option', async () => {
      const history = createMemoryHistory();
      const kernel = new RouterKernel(
        [createTestRoute('/'), createTestRoute('/users')],
        history
      );

      const replaceSpy = vi.spyOn(history, 'replace');

      await kernel.navigate('/users', { replace: true });

      expect(replaceSpy).toHaveBeenCalledWith('/users', undefined);
    });

    it('should navigate with RouteRef object', async () => {
      const history = createMemoryHistory();
      const kernel = new RouterKernel(
        [createTestRoute('/'), createTestRoute('/users')],
        history
      );

      const pushSpy = vi.spyOn(history, 'push');

      // Create a RouteRef object (just needs a path property for this test)
      const routeRef = { path: '/users' };
      await kernel.navigate(routeRef);

      expect(pushSpy).toHaveBeenCalledWith('/users', undefined);
    });

    it('should navigate with state', async () => {
      const history = createMemoryHistory();
      const kernel = new RouterKernel(
        [createTestRoute('/'), createTestRoute('/users')],
        history
      );

      const state = { from: 'home' };
      await kernel.navigate('/users', { state });

      // Note: Memory history doesn't support state, it's always null
      // This would work with browser history
      expect(kernel.currentRoute?.state).toBeNull();
    });

    it('should navigate using go', () => {
      const history = createMemoryHistory({ initialEntries: ['/', '/users'], initialIndex: 1 });
      const kernel = new RouterKernel(
        [createTestRoute('/'), createTestRoute('/users')],
        history
      );

      const goSpy = vi.spyOn(history, 'go');

      kernel.go(-1);

      expect(goSpy).toHaveBeenCalledWith(-1);
    });

    it('should navigate using back', () => {
      const history = createMemoryHistory({ initialEntries: ['/', '/users'], initialIndex: 1 });
      const kernel = new RouterKernel(
        [createTestRoute('/'), createTestRoute('/users')],
        history
      );

      const backSpy = vi.spyOn(history, 'back');

      kernel.back();

      expect(backSpy).toHaveBeenCalled();
    });

    it('should navigate using forward', () => {
      const history = createMemoryHistory({ initialEntries: ['/', '/users'], initialIndex: 0 });
      const kernel = new RouterKernel(
        [createTestRoute('/'), createTestRoute('/users')],
        history
      );

      const forwardSpy = vi.spyOn(history, 'forward');

      kernel.forward();

      expect(forwardSpy).toHaveBeenCalled();
    });

    it('should handle basePath in navigation', async () => {
      const history = createMemoryHistory({ initialEntries: ['/app/'] });
      const kernel = new RouterKernel([createTestRoute('/')], history, '/app');

      await kernel.navigate('/users');

      expect(history.location.pathname).toBe('/app/users');
    });

    // Navigation validation tests
    it('should return false when navigating to null target', async () => {
      const history = createMemoryHistory();
      const kernel = new RouterKernel([createTestRoute('/')], history);
      const initialRoute = kernel.currentRoute;

      const result = await kernel.navigate(null as any);

      expect(result).toBe(false);
      expect(kernel.currentRoute).toBe(initialRoute);
    });

    it('should return false when navigating to undefined target', async () => {
      const history = createMemoryHistory();
      const kernel = new RouterKernel([createTestRoute('/')], history);
      const initialRoute = kernel.currentRoute;

      const result = await kernel.navigate(undefined as any);

      expect(result).toBe(false);
      expect(kernel.currentRoute).toBe(initialRoute);
    });

    it('should return false when navigating with empty string path', async () => {
      const history = createMemoryHistory();
      const kernel = new RouterKernel([createTestRoute('/')], history);
      const initialRoute = kernel.currentRoute;

      const result = await kernel.navigate('');

      expect(result).toBe(false);
      expect(kernel.currentRoute).toBe(initialRoute);
    });

    it('should return false when navigating with excessively long path', async () => {
      const history = createMemoryHistory();
      const kernel = new RouterKernel([createTestRoute('/')], history);
      const initialRoute = kernel.currentRoute;
      const longPath = '/test/' + 'a'.repeat(3000);

      const result = await kernel.navigate(longPath);

      expect(result).toBe(false);
      expect(kernel.currentRoute).toBe(initialRoute);
    });

    it('should return false when navigating with null bytes in path', async () => {
      const history = createMemoryHistory();
      const kernel = new RouterKernel([createTestRoute('/')], history);
      const initialRoute = kernel.currentRoute;

      const result = await kernel.navigate('/test\0path');

      expect(result).toBe(false);
      expect(kernel.currentRoute).toBe(initialRoute);
    });

    it('should return false when navigating with control characters in path', async () => {
      const history = createMemoryHistory();
      const kernel = new RouterKernel([createTestRoute('/')], history);
      const initialRoute = kernel.currentRoute;

      const result = await kernel.navigate('/test\x01path');

      expect(result).toBe(false);
      expect(kernel.currentRoute).toBe(initialRoute);
    });

    it('should return false when navigating with dangerous protocol', async () => {
      const history = createMemoryHistory();
      const kernel = new RouterKernel([createTestRoute('/')], history);
      const initialRoute = kernel.currentRoute;

      const result = await kernel.navigate('javascript:alert(1)');

      expect(result).toBe(false);
      expect(kernel.currentRoute).toBe(initialRoute);
    });

    it('should return false when navigating with data protocol', async () => {
      const history = createMemoryHistory();
      const kernel = new RouterKernel([createTestRoute('/')], history);
      const initialRoute = kernel.currentRoute;

      const result = await kernel.navigate('data:text/html,<script>alert(1)</script>');

      expect(result).toBe(false);
      expect(kernel.currentRoute).toBe(initialRoute);
    });

    it('should return false when navigating with invalid options', async () => {
      const history = createMemoryHistory();
      const kernel = new RouterKernel([createTestRoute('/')], history);
      const initialRoute = kernel.currentRoute;

      const result = await kernel.navigate('/test', 'invalid' as any);

      expect(result).toBe(false);
      expect(kernel.currentRoute).toBe(initialRoute);
    });

    it('should emit error when navigation fails', async () => {
      const history = createMemoryHistory();
      const kernel = new RouterKernel([createTestRoute('/')], history);

      const errorHandler = vi.fn();
      kernel.on('error', errorHandler);

      // Make push fail by throwing
      vi.spyOn(history, 'push').mockImplementation(() => {
        throw new Error('Navigation failed');
      });

      await kernel.navigate('/test');

      expect(errorHandler).toHaveBeenCalled();
    });

    // Destroyed router tests
    it('should return false when navigating on destroyed router', async () => {
      const history = createMemoryHistory();
      const kernel = new RouterKernel([createTestRoute('/')], history);

      kernel.destroy();

      const result = await kernel.navigate('/test');

      expect(result).toBe(false);
    });

    it('should not call history back when router is destroyed', () => {
      const history = createMemoryHistory();
      const kernel = new RouterKernel([createTestRoute('/')], history);
      const backSpy = vi.spyOn(history, 'back');

      kernel.destroy();
      kernel.back();

      expect(backSpy).not.toHaveBeenCalled();
    });

    it('should not call history forward when router is destroyed', () => {
      const history = createMemoryHistory();
      const kernel = new RouterKernel([createTestRoute('/')], history);
      const forwardSpy = vi.spyOn(history, 'forward');

      kernel.destroy();
      kernel.forward();

      expect(forwardSpy).not.toHaveBeenCalled();
    });

    it('should not call history go when router is destroyed', () => {
      const history = createMemoryHistory();
      const kernel = new RouterKernel([createTestRoute('/')], history);
      const goSpy = vi.spyOn(history, 'go');

      kernel.destroy();
      kernel.go(1);

      expect(goSpy).not.toHaveBeenCalled();
    });

    // go() validation tests
    it('should not call history go with non-number delta', () => {
      const history = createMemoryHistory();
      const kernel = new RouterKernel([createTestRoute('/')], history);
      const goSpy = vi.spyOn(history, 'go');
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      kernel.go('1' as any);

      expect(goSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Navigation delta must be a number');

      consoleErrorSpy.mockRestore();
    });

    it('should not call history go with infinite delta', () => {
      const history = createMemoryHistory();
      const kernel = new RouterKernel([createTestRoute('/')], history);
      const goSpy = vi.spyOn(history, 'go');
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      kernel.go(Infinity);

      expect(goSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Navigation delta must be a finite number');

      consoleErrorSpy.mockRestore();
    });

    it('should not call history go with NaN delta', () => {
      const history = createMemoryHistory();
      const kernel = new RouterKernel([createTestRoute('/')], history);
      const goSpy = vi.spyOn(history, 'go');
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      kernel.go(NaN);

      expect(goSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Navigation delta must be a finite number');

      consoleErrorSpy.mockRestore();
    });

    // Plugin validation tests
    it('should throw error when registering plugin on destroyed router', () => {
      const history = createMemoryHistory();
      const kernel = new RouterKernel([createTestRoute('/')], history);

      kernel.destroy();

      const plugin: RouterPlugin = {
        name: 'test-plugin',
        install: vi.fn(),
      };

      expect(() => kernel.use(plugin)).toThrow('Cannot register plugin: router has been destroyed');
    });

    it('should throw error when registering non-object plugin', () => {
      const history = createMemoryHistory();
      const kernel = new RouterKernel([createTestRoute('/')], history);

      expect(() => kernel.use(null as any)).toThrow(TypeError('Plugin must be an object'));
    });

    it('should throw error when registering plugin with empty name', () => {
      const history = createMemoryHistory();
      const kernel = new RouterKernel([createTestRoute('/')], history);

      const plugin: RouterPlugin = {
        name: '',
        install: vi.fn(),
      };

      expect(() => kernel.use(plugin)).toThrow(TypeError('Plugin must have a non-empty name property'));
    });

    it('should throw error when registering plugin without install method', () => {
      const history = createMemoryHistory();
      const kernel = new RouterKernel([createTestRoute('/')], history);

      const plugin = { name: 'test-plugin' } as RouterPlugin;

      expect(() => kernel.use(plugin)).toThrow(TypeError('Plugin "test-plugin" must have an install method'));
    });
  });
});
