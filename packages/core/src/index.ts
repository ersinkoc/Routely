/**
 * Routely Core - Framework-agnostic routing kernel.
 * @packageDocumentation
 */

// Types
export type {
  Route,
  RouteDefinition,
  Router,
  RouterOptions,
  RouterPlugin,
  RouterEvent,
  RouterEventHandler,
  NavigateOptions,
  History,
  Location,
  LocationListener,
  MemoryHistoryOptions,
  RouteRef,
  RouteMatch,
  ExtractParams,
} from './types.js';

// Router
export { createRouter, route } from './router.js';

// History
export { createBrowserHistory, createMemoryHistory, createHashHistory } from './history.js';

// Registry
export { createRoutes } from './registry.js';
export type { RouteRegistry, TypedRoutes } from './registry.js';

// Errors
export { RouterError, createNotFoundError, createGuardError, createPluginError } from './errors.js';

// Utilities (internal, but exported for advanced use)
export {
  parsePath,
  joinPaths,
  normalizeSlashes,
  parseSearch,
  stringifySearch,
  stripBasePath,
  addBasePath,
} from './utils.js';

// Matcher (internal, but exported for advanced use)
export {
  pathToRegex,
  extractParams,
  calculateScore,
  rankRoutes,
  matchRoute,
  RouteMatcher,
} from './matcher.js';
