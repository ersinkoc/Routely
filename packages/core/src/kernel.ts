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
  Router,
} from './types.js';
import { matchRoute } from './matcher.js';
import { parsePath, parseSearch, stripBasePath } from './utils.js';
import { createNotFoundError, createPluginError } from './errors.js';
import { MAX_NAVIGATION_PATH_LENGTH, NAVIGATION_GUARD_TIMEOUT_MS } from './constants.js';

/**
 * Internal state tracking for navigation locks.
 */
interface NavigationLock {
  promise: Promise<boolean>;
  resolve: (value: boolean) => void;
}

/**
 * Router kernel class.
 * @internal
 */
export class RouterKernel<TComponent = unknown> implements Router<TComponent> {
  private _currentRoute: Route | null = null;
  private _listeners = new Map<RouterEvent, Set<RouterEventHandler>>();
  private _plugins = new Map<string, RouterPlugin<TComponent>>();
  private _routes: RouteDefinition<TComponent>[];
  private _history: History;
  private _basePath: string;
  private _unsubscribeHistory: (() => void) | null = null;
  private _isDestroyed = false;
  private _pendingInitialError: Error | null = null;
  private _initializationComplete = false;
  private _isHandlingLocationChange = false;
  private _pendingLocationChange: string | null = null;
  private _navigationLock: NavigationLock | null = null;

  constructor(routes: RouteDefinition<TComponent>[], history: History, basePath: string = '') {
    this._routes = routes;
    this._history = history;
    this._basePath = basePath;

    // Step 1: Perform synchronous initial route matching FIRST
    // This ensures we have a consistent state before any async operations
    // Construct full path including search and hash
    const fullPath = `${this._history.location.pathname}${this._history.location.search}${this._history.location.hash}`;
    const strippedPath = stripBasePath(fullPath, this._basePath);
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
      // Store error to emit after listener is ready
      this._pendingInitialError = createNotFoundError(fullPath);
    }

    // Mark initialization as complete
    this._initializationComplete = true;

    // Step 2: Set up history listener immediately (synchronously)
    // This ensures we don't miss any navigation that happens right after construction
    // The listener will be called when history.push/replace is invoked
    this._unsubscribeHistory = this._history.listen((location) => {
      if (!this._isDestroyed) {
        // Queue the location change to prevent concurrent handling
        const fullPath = `${location.pathname}${location.search}${location.hash}`;
        void this._queueLocationChange(fullPath);
      }
    });

    // Step 3: Emit initial error if there was one (after listener is ready)
    if (this._pendingInitialError) {
      this._emit('error', this._pendingInitialError);
      this._pendingInitialError = null;
    }
  }

  /**
   * Queue a location change to prevent concurrent navigation handling.
   * Uses a simple queue mechanism to ensure navigation changes are processed sequentially.
   */
  private async _queueLocationChange(fullPath: string): Promise<void> {
    // If we're already handling a location change, store this one for later
    if (this._isHandlingLocationChange) {
      this._pendingLocationChange = fullPath;
      return;
    }

    // Check if there's an active navigation lock (from router.navigate())
    // If so, we need to resolve it after handling this location change
    const hasActiveLock = this._navigationLock !== null;

    await this._handleLocationChange(fullPath);

    // Resolve the navigation lock to signal completion
    // This is set by router.navigate() to wait for the location change to complete
    if (hasActiveLock && this._navigationLock) {
      this._navigationLock.resolve(true);
      this._navigationLock = null;
    }

    // Process any pending location change that occurred during handling
    if (this._pendingLocationChange) {
      const pending = this._pendingLocationChange;
      this._pendingLocationChange = null;
      await this._handleLocationChange(pending);
    }
  }

  get currentRoute(): Route | null {
    return this._currentRoute;
  }

  get routes(): RouteDefinition<TComponent>[] {
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
  private async _handleLocationChange(fullPath: string): Promise<void> {
    // Set flag to prevent concurrent location changes
    this._isHandlingLocationChange = true;

    try {
      const strippedPath = stripBasePath(fullPath, this._basePath);
      const { pathname: normalizedPath, search, hash } = parsePath(strippedPath);

      const match = matchRoute(normalizedPath, this._routes);

      if (!match) {
        const error = createNotFoundError(fullPath);
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
    } finally {
      this._isHandlingLocationChange = false;
    }
  }

  /**
   * Navigate to a new route.
   */
  async navigate(to: string | RouteRef, options: NavigateOptions = {}): Promise<boolean> {
    if (this._isDestroyed) {
      console.warn('Cannot navigate: router has been destroyed');
      return false;
    }

    // Validate navigation target
    if (to === null || to === undefined) {
      console.error('Navigation target cannot be null or undefined');
      return false;
    }

    const path = typeof to === 'string' ? to : to.path;

    // Validate path
    if (typeof path !== 'string') {
      console.error('Navigation path must be a string');
      return false;
    }

    if (path.length === 0) {
      console.error('Navigation path cannot be empty');
      return false;
    }

    if (path.length > MAX_NAVIGATION_PATH_LENGTH) {
      console.error(`Navigation path too long (max ${MAX_NAVIGATION_PATH_LENGTH} characters)`);
      return false;
    }

    // Check for null bytes
    if (path.includes('\0')) {
      console.error('Navigation path cannot contain null bytes');
      return false;
    }

    // Check for control characters (security)
    if (/[\x00-\x1F\x7F]/.test(path)) {
      console.error('Navigation path contains invalid control characters');
      return false;
    }

    // Check for dangerous protocols (XSS prevention)
    const dangerousProtocols = /^(javascript|data|vbscript|file|about):/i;
    if (dangerousProtocols.test(path)) {
      console.error('Navigation path contains dangerous protocol');
      return false;
    }

    // Validate options
    if (options && typeof options !== 'object') {
      console.error('Navigation options must be an object');
      return false;
    }

    const fullPath = this._basePath ? `${this._basePath}${path}` : path;

    try {
      // Create a navigation lock to wait for this navigation to complete
      const lock = this._createNavigationLock();

      if (options.replace) {
        this._history.replace(fullPath, options.state);
      } else {
        this._history.push(fullPath, options.state);
      }

      // Wait for the location change to be processed
      await lock.promise;

      return true;
    } catch (error) {
      console.error('Navigation failed:', error);
      this._emit('error', error);
      return false;
    }
  }

  /**
   * Create a navigation lock that resolves when the current location change is processed.
   */
  private _createNavigationLock(): NavigationLock {
    let resolve: ((value: boolean) => void) | undefined;
    const promise = new Promise<boolean>((r) => {
      resolve = r;
    });

    const lock: NavigationLock = {
      promise,
      resolve: resolve!,
    };

    // Store the lock so it can be resolved by _queueLocationChange
    this._navigationLock = lock;

    return lock;
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

    // Validate delta parameter
    if (typeof delta !== 'number') {
      console.error('Navigation delta must be a number');
      return;
    }

    if (!Number.isFinite(delta)) {
      console.error('Navigation delta must be a finite number');
      return;
    }

    this._history.go(delta);
  }

  /**
   * Register a plugin.
   */
  use(plugin: RouterPlugin<TComponent>): this {
    if (this._isDestroyed) {
      throw new Error('Cannot register plugin: router has been destroyed');
    }

    // Validate plugin
    if (!plugin || typeof plugin !== 'object') {
      throw new TypeError('Plugin must be an object');
    }

    if (typeof plugin.name !== 'string' || plugin.name.length === 0) {
      throw new TypeError('Plugin must have a non-empty name property');
    }

    if (typeof plugin.install !== 'function') {
      throw new TypeError(`Plugin "${plugin.name}" must have an install method`);
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

    // Temporarily store plugin for rollback on error
    let pluginRegistered = false;

    try {
      // Register plugin ONLY after successful install
      // This ensures broken plugins don't remain in the system
      // RouterKernel implements Router<TComponent>, so this is safe
      plugin.install(this as unknown as Router<TComponent>);

      // Only add to plugins map if install succeeded
      this._plugins.set(plugin.name, plugin);
      pluginRegistered = true;

      if (plugin.onInit) {
        void plugin.onInit();
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      const pluginError = createPluginError(plugin.name, err);

      // Only emit error if we're not already destroyed
      if (!this._isDestroyed) {
        this._emit('error', pluginError);
      }

      // Call plugin's error handler if it exists
      if (plugin.onError) {
        try {
          plugin.onError(pluginError);
        } catch (onErrorError) {
          // Don't let onError errors propagate
          console.error(`Error in plugin "${plugin.name}" onError handler:`, onErrorError);
        }
      }

      // Re-throw to prevent silent failures
      // The caller should handle this error
      throw pluginError;
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
  private _emit(event: 'beforeNavigate', to: Route, from: Route | null): void;
  private _emit(event: 'afterNavigate', route: Route): void;
  private _emit(event: 'error', error: Error): void;
  private _emit(event: RouterEvent, ...args: unknown[]): void {
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
   * Returns false if timeout occurs (safer than allowing navigation).
   */
  private async _emitBeforeNavigateWithTimeout(
    to: Route,
    from: Route | null
  ): Promise<boolean> {
    try {
      // Add timeout protection - REJECT navigation on timeout for security
      const result = await Promise.race([
        this._emitBeforeNavigate(to, from),
        new Promise<boolean>((resolve) =>
          setTimeout(() => {
            console.warn('Navigation guard timeout - blocking navigation for security');
            resolve(false); // Changed from true to false for security
          }, NAVIGATION_GUARD_TIMEOUT_MS)
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
