/**
 * Router kernel - Core routing logic and plugin coordination.
 * @packageDocumentation
 */

import type {
  Route,
  RouteDefinition,
  RouterPlugin,
  RouterEvent,
  RouterEventHandler,
  NavigateOptions,
  History,
  RouteRef,
} from './types.js';
import { matchRoute } from './matcher.js';
import { parsePath, parseSearch, stripBasePath } from './utils.js';
import { createNotFoundError, createPluginError } from './errors.js';

/**
 * Router kernel class.
 */
export class RouterKernel {
  private _currentRoute: Route | null = null;
  private _listeners = new Map<RouterEvent, Set<RouterEventHandler>>();
  private _plugins = new Map<string, RouterPlugin>();
  private _routes: RouteDefinition[];
  private _history: History;
  private _basePath: string;
  private _unsubscribeHistory: (() => void) | null = null;
  private _isDestroyed = false;

  constructor(routes: RouteDefinition[], history: History, basePath: string = '') {
    this._routes = routes;
    this._history = history;
    this._basePath = basePath;

    // Listen to history changes and store unsubscribe function
    this._unsubscribeHistory = this._history.listen((location) => {
      if (!this._isDestroyed) {
        void this._handleLocationChange(location.pathname);
      }
    });

    // Perform synchronous initial navigation
    const initialPath = this._history.location.pathname;
    const strippedPath = stripBasePath(initialPath, this._basePath);
    const { pathname: normalizedPath, search, hash } = parsePath(strippedPath);
    const match = matchRoute(normalizedPath, this._routes);

    if (match) {
      this._currentRoute = {
        path: match.route.path,
        params: match.params,
        search: parseSearch(search),
        hash: hash.slice(1),
        state: this._history.location.state,
        meta: match.route.meta || {},
      };
    } else {
      const error = createNotFoundError(initialPath);
      this._emit('error', error);
    }
  }

  get currentRoute(): Route | null {
    return this._currentRoute;
  }

  get routes(): RouteDefinition[] {
    return this._routes;
  }

  get history(): History {
    return this._history;
  }

  /**
   * Destroy the router kernel and cleanup resources.
   */
  destroy(): void {
    if (this._isDestroyed) {
      return;
    }

    this._isDestroyed = true;

    // Unsubscribe from history changes
    if (this._unsubscribeHistory) {
      this._unsubscribeHistory();
      this._unsubscribeHistory = null;
    }

    // Clear all listeners
    this._listeners.clear();

    // Destroy all plugins
    for (const [name, plugin] of this._plugins) {
      if (plugin.onDestroy) {
        try {
          void plugin.onDestroy();
        } catch (error) {
          console.error(`Error destroying plugin "${name}":`, error);
        }
      }
    }
    this._plugins.clear();
  }

  /**
   * Handle location changes with timeout protection.
   */
  private async _handleLocationChange(pathname: string): Promise<void> {
    const strippedPath = stripBasePath(pathname, this._basePath);
    const { pathname: normalizedPath, search, hash } = parsePath(strippedPath);

    const match = matchRoute(normalizedPath, this._routes);

    if (!match) {
      const error = createNotFoundError(pathname);
      this._emit('error', error);
      return;
    }

    const route: Route = {
      path: match.route.path,
      params: match.params,
      search: parseSearch(search),
      hash: hash.slice(1),
      state: this._history.location.state,
      meta: match.route.meta || {},
    };

    // Add timeout protection for beforeNavigate guards
    const allowed = await this._emitBeforeNavigateWithTimeout(route, this._currentRoute);

    if (!allowed) {
      return;
    }

    this._currentRoute = route;
    this._emit('afterNavigate', route);
  }

  /**
   * Navigate to a new route.
   */
  async navigate(to: string | RouteRef, options: NavigateOptions = {}): Promise<boolean> {
    if (this._isDestroyed) {
      console.warn('Cannot navigate: router has been destroyed');
      return false;
    }

    const path = typeof to === 'string' ? to : to.path;
    const fullPath = this._basePath ? `${this._basePath}${path}` : path;

    try {
      if (options.replace) {
        this._history.replace(fullPath, options.state);
      } else {
        this._history.push(fullPath, options.state);
      }
      return true;
    } catch (error) {
      console.error('Navigation failed:', error);
      this._emit('error', error);
      return false;
    }
  }

  /**
   * Navigate back.
   */
  back(): void {
    if (this._isDestroyed) return;
    this._history.back();
  }

  /**
   * Navigate forward.
   */
  forward(): void {
    if (this._isDestroyed) return;
    this._history.forward();
  }

  /**
   * Navigate by delta.
   */
  go(delta: number): void {
    if (this._isDestroyed) return;
    this._history.go(delta);
  }

  /**
   * Register a plugin.
   */
  use(plugin: RouterPlugin): this {
    if (this._isDestroyed) {
      throw new Error('Cannot register plugin: router has been destroyed');
    }

    if (this._plugins.has(plugin.name)) {
      throw new Error(`Plugin "${plugin.name}" is already registered`);
    }

    // Check dependencies
    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        if (!this._plugins.has(dep)) {
          throw new Error(`Plugin "${plugin.name}" depends on "${dep}" which is not registered`);
        }
      }
    }

    this._plugins.set(plugin.name, plugin);

    try {
      plugin.install(this as any);

      if (plugin.onInit) {
        void plugin.onInit();
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      const pluginError = createPluginError(plugin.name, err);
      this._emit('error', pluginError);

      if (plugin.onError) {
        plugin.onError(pluginError);
      }
    }

    return this;
  }

  /**
   * Unregister a plugin.
   */
  unregister(name: string): void {
    const plugin = this._plugins.get(name);

    if (!plugin) {
      return;
    }

    if (plugin.onDestroy) {
      try {
        void plugin.onDestroy();
      } catch (error) {
        console.error(`Error destroying plugin "${name}":`, error);
      }
    }

    this._plugins.delete(name);
  }

  /**
   * List registered plugins.
   */
  list(): string[] {
    return Array.from(this._plugins.keys());
  }

  /**
   * Add event listener.
   */
  on(event: RouterEvent, handler: RouterEventHandler): () => void {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }

    this._listeners.get(event)!.add(handler);

    return () => this.off(event, handler);
  }

  /**
   * Remove event listener.
   */
  off(event: RouterEvent, handler: RouterEventHandler): void {
    const handlers = this._listeners.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Emit event to listeners.
   */
  private _emit(event: RouterEvent, ...args: any[]): void {
    if (this._isDestroyed) return;

    const handlers = this._listeners.get(event);
    if (handlers && handlers.size > 0) {
      handlers.forEach((handler) => {
        try {
          void handler(...args);
        } catch (error) {
          console.error(`Error in ${event} handler:`, error);
        }
      });
    }
  }

  /**
   * Emit beforeNavigate and check plugin guards with timeout protection.
   */
  private async _emitBeforeNavigateWithTimeout(
    to: Route,
    from: Route | null
  ): Promise<boolean> {
    const TIMEOUT_MS = 5000; // 5 second timeout for guards

    try {
      // Add timeout protection
      const result = await Promise.race([
        this._emitBeforeNavigate(to, from),
        new Promise<boolean>((resolve) =>
          setTimeout(() => {
            console.warn('Navigation guard timeout - allowing navigation');
            resolve(true);
          }, TIMEOUT_MS)
        ),
      ]);

      return result;
    } catch (error) {
      console.error('Error in beforeNavigate guards:', error);
      return false;
    }
  }

  /**
   * Emit beforeNavigate and check plugin guards.
   */
  private async _emitBeforeNavigate(to: Route, from: Route | null): Promise<boolean> {
    const handlers = this._listeners.get('beforeNavigate');
    if (handlers && handlers.size > 0) {
      for (const handler of handlers) {
        try {
          const result = await handler(to, from);
          if (result === false) {
            return false;
          }
        } catch (error) {
          console.error('Error in beforeNavigate handler:', error);
          return false;
        }
      }
    }

    // Check plugin guards
    for (const plugin of this._plugins.values()) {
      if (plugin.onBeforeNavigate) {
        try {
          const allowed = await plugin.onBeforeNavigate(to, from);
          if (allowed === false) {
            return false;
          }
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          if (plugin.onError) {
            plugin.onError(createPluginError(plugin.name, err));
          }
          return false;
        }
      }
    }

    return true;
  }
}
