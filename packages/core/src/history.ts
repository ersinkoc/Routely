/**
 * History abstraction for browser, memory, and hash-based routing.
 * @packageDocumentation
 */

import type { History, Location, LocationListener, MemoryHistoryOptions } from './types.js';
import { MAX_NAVIGATION_PATH_LENGTH } from './constants.js';

/**
 * Validate path for history navigation.
 * Prevents dangerous protocols and invalid paths.
 * @internal
 */
function validatePath(path: string, methodName: string): void {
  if (typeof path !== 'string') {
    throw new TypeError(`${methodName}: path must be a string`);
  }

  if (path.length === 0) {
    throw new Error(`${methodName}: path cannot be empty`);
  }

  if (path.length > MAX_NAVIGATION_PATH_LENGTH) {
    throw new Error(`${methodName}: path too long (max ${MAX_NAVIGATION_PATH_LENGTH} characters)`);
  }

  // Check for null bytes
  if (path.includes('\0')) {
    throw new Error(`${methodName}: path cannot contain null bytes`);
  }

  // Check for control characters
  if (/[\x00-\x1F\x7F]/.test(path)) {
    throw new Error(`${methodName}: path contains invalid control characters`);
  }

  // Check for dangerous protocols (XSS prevention)
  const dangerousProtocols = /^(javascript|data|vbscript|file|about):/i;
  if (dangerousProtocols.test(path)) {
    throw new Error(`${methodName}: path contains dangerous protocol`);
  }
}

/**
 * Create a browser history instance using the History API.
 */
export function createBrowserHistory(): History {
  const listeners = new Set<LocationListener>();

  const getLocation = (): Location => ({
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
    state: window.history.state,
  });

  const location = {
    get pathname() {
      return window.location.pathname;
    },
    get search() {
      return window.location.search;
    },
    get hash() {
      return window.location.hash;
    },
    get state() {
      return window.history.state;
    },
  };

  const notifyListeners = () => {
    const loc = getLocation();
    listeners.forEach((listener) => listener(loc));
  };

  const handlePopState = () => {
    notifyListeners();
  };

  const push = (path: string, state?: unknown) => {
    validatePath(path, 'push');
    window.history.pushState(state, '', path);
    notifyListeners();
  };

  const replace = (path: string, state?: unknown) => {
    validatePath(path, 'replace');
    window.history.replaceState(state, '', path);
    notifyListeners();
  };

  const go = (delta: number) => {
    window.history.go(delta);
  };

  const listen = (listener: LocationListener) => {
    listeners.add(listener);

    // Add event listener only when the first listener is registered
    if (listeners.size === 1) {
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      listeners.delete(listener);

      // Remove event listener when no more listeners
      if (listeners.size === 0) {
        window.removeEventListener('popstate', handlePopState);
      }
    };
  };

  return {
    location,
    push,
    replace,
    go,
    back: () => go(-1),
    forward: () => go(1),
    listen,
  };
}

/**
 * Create a memory history instance for SSR and testing.
 */
export function createMemoryHistory(options?: MemoryHistoryOptions): History {
  const entries = [...(options?.initialEntries || ['/'])];
  let index = options?.initialIndex ?? entries.length - 1;
  const listeners = new Set<LocationListener>();

  const getLocation = (): Location => {
    const entry = entries[index] ?? '/';
    const url = new URL(entry, 'http://localhost');
    return {
      pathname: url.pathname,
      search: url.search,
      hash: url.hash,
      state: null,
    };
  };

  const location = {
    get pathname() {
      return getLocation().pathname;
    },
    get search() {
      return getLocation().search;
    },
    get hash() {
      return getLocation().hash;
    },
    get state() {
      return getLocation().state;
    },
  };

  const notifyListeners = () => {
    const loc = getLocation();
    listeners.forEach((listener) => listener(loc));
  };

  const push = (path: string, _state?: unknown) => {
    validatePath(path, 'push (memory)');
    // Remove all entries after current index before pushing
    entries.splice(index + 1);
    entries.push(path);
    index = entries.length - 1;
    notifyListeners();
  };

  const replace = (path: string, _state?: unknown) => {
    validatePath(path, 'replace (memory)');
    entries[index] = path;
    notifyListeners();
  };

  const go = (delta: number) => {
    const nextIndex = index + delta;
    if (nextIndex >= 0 && nextIndex < entries.length) {
      index = nextIndex;
      notifyListeners();
    }
  };

  const listen = (listener: LocationListener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return {
    location,
    push,
    replace,
    go,
    back: () => go(-1),
    forward: () => go(1),
    listen,
  };
}

/**
 * Create a hash history instance for legacy browser support.
 */
export function createHashHistory(): History {
  const listeners = new Set<LocationListener>();

  const getHash = (): string => {
    const hash = window.location.hash.slice(1);
    return hash || '/';
  };

  const getLocation = (): Location => {
    const hash = getHash();
    const url = new URL(hash, 'http://localhost');
    return {
      pathname: url.pathname,
      search: url.search,
      hash: url.hash,
      state: null,
    };
  };

  const location = {
    get pathname() {
      return getLocation().pathname;
    },
    get search() {
      return getLocation().search;
    },
    get hash() {
      return getLocation().hash;
    },
    get state() {
      return null;
    },
  };

  const notifyListeners = () => {
    const loc = getLocation();
    listeners.forEach((listener) => listener(loc));
  };

  const handleHashChange = () => {
    notifyListeners();
  };

  const push = (path: string, _state?: unknown) => {
    validatePath(path, 'push (hash)');
    window.location.hash = path;
  };

  const replace = (path: string, _state?: unknown) => {
    validatePath(path, 'replace (hash)');
    const index = window.location.href.indexOf('#');
    const base = index >= 0 ? window.location.href.slice(0, index) : window.location.href;
    window.location.replace(`${base}#${path}`);
  };

  const go = (delta: number) => {
    window.history.go(delta);
  };

  const listen = (listener: LocationListener) => {
    listeners.add(listener);

    // Add event listener only when the first listener is registered
    if (listeners.size === 1) {
      window.addEventListener('hashchange', handleHashChange);
    }

    return () => {
      listeners.delete(listener);

      // Remove event listener when no more listeners
      if (listeners.size === 0) {
        window.removeEventListener('hashchange', handleHashChange);
      }
    };
  };

  return {
    location,
    push,
    replace,
    go,
    back: () => go(-1),
    forward: () => go(1),
    listen,
  };
}
