/**
 * Core type definitions for Routely router.
 * @packageDocumentation
 */

/**
 * Represents a matched route with all its properties.
 *
 * @example
 * ```typescript
 * const route: Route = {
 *   path: '/users/123',
 *   params: { id: '123' },
 *   search: { page: '1' },
 *   hash: '#profile',
 *   state: { from: '/home' },
 *   meta: { title: 'User Profile' },
 * };
 * ```
 */
export interface Route {
  /** The matched path */
  path: string;
  /** Extracted URL parameters */
  params: Record<string, string>;
  /** Parsed search/query parameters */
  search: Record<string, string>;
  /** URL hash (without #) */
  hash: string;
  /** Arbitrary state data passed during navigation */
  state: unknown;
  /** Route metadata */
  meta: Record<string, unknown>;
}

/**
 * Route definition structure for creating routes.
 *
 * @example
 * ```typescript
 * const userRoute: RouteDefinition = {
 *   path: '/users/:id',
 *   component: UserDetail,
 *   children: [
 *     { path: 'posts', component: UserPosts },
 *   ],
 *   meta: { requiresAuth: true },
 * };
 * ```
 */
export interface RouteDefinition {
  /** Path pattern (e.g., '/users/:id') */
  path: string;
  /** Component to render for this route */
  component: any;
  /** Nested child routes */
  children?: RouteDefinition[];
  /** Route metadata */
  meta?: Record<string, unknown>;
}

/**
 * Options for creating a router.
 *
 * @example
 * ```typescript
 * const options: RouterOptions = {
 *   routes: [
 *     route('/', Home),
 *     route('/users', Users),
 *   ],
 *   history: createBrowserHistory(),
 *   basePath: '/app',
 * };
 * ```
 */
export interface RouterOptions {
  /** Array of route definitions */
  routes: RouteDefinition[];
  /** History implementation (defaults to browser history) */
  history?: History;
  /** Base path for all routes */
  basePath?: string;
}

/**
 * Router instance interface.
 *
 * @example
 * ```typescript
 * const router = createRouter({ routes });
 * router.navigate('/users');
 * router.use(myPlugin);
 * ```
 */
export interface Router {
  /** Current matched route (null if no route matched yet) */
  readonly currentRoute: Route | null;
  /** All registered routes */
  readonly routes: RouteDefinition[];
  /** History instance */
  readonly history: History;

  /**
   * Navigate to a new route.
   * @param to - Target path or route reference
   * @param options - Navigation options
   */
  navigate(to: string | RouteRef, options?: NavigateOptions): void;

  /** Navigate back in history */
  back(): void;

  /** Navigate forward in history */
  forward(): void;

  /**
   * Navigate by delta in history.
   * @param delta - Number of steps (negative for back, positive for forward)
   */
  go(delta: number): void;

  /**
   * Register a plugin.
   * @param plugin - Plugin to register
   * @returns Router instance for chaining
   */
  use(plugin: RouterPlugin): Router;

  /**
   * Unregister a plugin by name.
   * @param name - Plugin name to unregister
   */
  unregister(name: string): void;

  /**
   * List all registered plugins.
   * @returns Array of plugin names
   */
  list(): string[];

  /**
   * Listen to router events.
   * @param event - Event name
   * @param handler - Event handler function
   * @returns Unsubscribe function
   */
  on(event: RouterEvent, handler: RouterEventHandler): () => void;

  /**
   * Remove event listener.
   * @param event - Event name
   * @param handler - Event handler to remove
   */
  off(event: RouterEvent, handler: RouterEventHandler): void;
}

/**
 * Navigation options.
 *
 * @example
 * ```typescript
 * navigate('/users', { replace: true, state: { from: '/home' } });
 * ```
 */
export interface NavigateOptions {
  /** Replace current history entry instead of pushing */
  replace?: boolean;
  /** State data to pass with navigation */
  state?: unknown;
}

/**
 * Router events.
 */
export type RouterEvent = 'beforeNavigate' | 'afterNavigate' | 'error';

/**
 * Event handler function type.
 */
export type RouterEventHandler = (...args: any[]) => void | boolean | Promise<void | boolean>;

/**
 * Plugin interface for extending router functionality.
 *
 * @example
 * ```typescript
 * const myPlugin: RouterPlugin = {
 *   name: 'my-plugin',
 *   version: '1.0.0',
 *   install(router) {
 *     router.on('beforeNavigate', (to, from) => {
 *       console.log(`Navigating from ${from?.path} to ${to.path}`);
 *     });
 *   },
 * };
 * ```
 */
export interface RouterPlugin {
  /** Unique plugin identifier (kebab-case) */
  name: string;

  /** Semantic version */
  version: string;

  /** Plugin dependencies (other plugin names) */
  dependencies?: string[];

  /**
   * Called when plugin is registered.
   * @param router - Router instance
   */
  install: (router: Router) => void;

  /** Called after all plugins installed and router is ready */
  onInit?: () => void | Promise<void>;

  /**
   * Called before navigation occurs. Return false to cancel.
   * @param to - Target route
   * @param from - Current route (null if initial navigation)
   * @returns true to allow, false to cancel navigation
   */
  onBeforeNavigate?: (to: Route, from: Route | null) => boolean | Promise<boolean>;

  /**
   * Called after navigation completes.
   * @param route - New current route
   */
  onAfterNavigate?: (route: Route) => void;

  /** Called when plugin is unregistered */
  onDestroy?: () => void | Promise<void>;

  /**
   * Called on error in this plugin.
   * @param error - The error that occurred
   */
  onError?: (error: RouterError) => void;
}

/**
 * History abstraction for different navigation modes.
 *
 * @example
 * ```typescript
 * const history = createBrowserHistory();
 * history.push('/users');
 * history.listen((location) => console.log(location.pathname));
 * ```
 */
export interface History {
  /** Current location */
  readonly location: Location;

  /**
   * Push a new entry to history.
   * @param path - Path to navigate to
   * @param state - Optional state data
   */
  push(path: string, state?: unknown): void;

  /**
   * Replace current history entry.
   * @param path - Path to navigate to
   * @param state - Optional state data
   */
  replace(path: string, state?: unknown): void;

  /**
   * Navigate by delta.
   * @param delta - Number of steps
   */
  go(delta: number): void;

  /** Navigate back one step */
  back(): void;

  /** Navigate forward one step */
  forward(): void;

  /**
   * Listen to location changes.
   * @param listener - Listener function
   * @returns Unsubscribe function
   */
  listen(listener: LocationListener): () => void;
}

/**
 * Location object representing current URL.
 *
 * @example
 * ```typescript
 * const location: Location = {
 *   pathname: '/users/123',
 *   search: '?page=1',
 *   hash: '#profile',
 *   state: { from: '/home' },
 * };
 * ```
 */
export interface Location {
  /** URL pathname */
  pathname: string;
  /** URL search/query string (with ?) */
  search: string;
  /** URL hash (with #) */
  hash: string;
  /** State data */
  state: unknown;
}

/**
 * Location listener function type.
 */
export type LocationListener = (location: Location) => void;

/**
 * Memory history options.
 */
export interface MemoryHistoryOptions {
  /** Initial entries in history stack */
  initialEntries?: string[];
  /** Initial index in the stack */
  initialIndex?: number;
}

/**
 * Route reference for type-safe navigation.
 */
export interface RouteRef<TParams = Record<string, string>> {
  /** Path pattern */
  path: string;
  /** Build path with parameters */
  build(params: TParams): string;
  /** String representation */
  toString(): string;
}

/**
 * Router error class.
 */
export interface RouterError extends Error {
  /** Error code */
  code: 'ROUTE_NOT_FOUND' | 'GUARD_REJECTED' | 'PLUGIN_ERROR';
  /** Route that caused the error (if applicable) */
  route?: Route;
  /** Plugin that caused the error (if applicable) */
  plugin?: string;
}

/**
 * Route match result.
 */
export interface RouteMatch {
  /** Matched route definition */
  route: RouteDefinition;
  /** Extracted parameters */
  params: Record<string, string>;
}

/**
 * Extract parameter names from a path pattern.
 *
 * @typeParam T - Path pattern string
 *
 * @example
 * ```typescript
 * type Params = ExtractParams<'/users/:id/posts/:postId'>;
 * // Result: { id: string; postId: string }
 * ```
 */
export type ExtractParams<T extends string> = T extends `${infer _Start}:${infer Param}/${infer Rest}`
  ? { [K in Param]: string } & ExtractParams<`/${Rest}`>
  : T extends `${infer _Start}:${infer Param}`
  ? { [K in Param]: string }
  : {};
