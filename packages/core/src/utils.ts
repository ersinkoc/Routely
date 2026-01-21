/**
 * Utility functions for Routely router.
 * @packageDocumentation
 */

/**
 * Parse a URL path into its components.
 *
 * @param path - URL path to parse
 * @returns Parsed path components
 *
 * @example
 * ```typescript
 * const parsed = parsePath('/users?page=1#profile');
 * // { pathname: '/users', search: '?page=1', hash: '#profile' }
 * ```
 */
export function parsePath(path: string): {
  pathname: string;
  search: string;
  hash: string;
} {
  const hashIndex = path.indexOf('#');
  const searchIndex = path.indexOf('?');

  let pathname = path;
  let search = '';
  let hash = '';

  if (hashIndex >= 0) {
    hash = path.slice(hashIndex);
    pathname = path.slice(0, hashIndex);
  }

  if (searchIndex >= 0 && searchIndex < (hashIndex >= 0 ? hashIndex : path.length)) {
    search = pathname.slice(searchIndex);
    pathname = pathname.slice(0, searchIndex);
  }

  return { pathname, search, hash };
}

/**
 * Join path segments, handling slashes correctly.
 *
 * @param segments - Path segments to join
 * @returns Joined path
 *
 * @example
 * ```typescript
 * joinPaths('/users', 'profile'); // '/users/profile'
 * joinPaths('/users/', '/profile'); // '/users/profile'
 * ```
 */
export function joinPaths(...segments: string[]): string {
  return segments
    .map((segment, index) => {
      // Remove leading slash from all but first segment
      if (index > 0 && segment.startsWith('/')) {
        segment = segment.slice(1);
      }
      // Remove trailing slash from all but last segment
      if (index < segments.length - 1 && segment.endsWith('/')) {
        segment = segment.slice(0, -1);
      }
      return segment;
    })
    .filter((segment) => segment.length > 0)
    .join('/');
}

/**
 * Normalize slashes in a path.
 *
 * @param path - Path to normalize
 * @returns Normalized path
 *
 * @example
 * ```typescript
 * normalizeSlashes('//users///profile//'); // '/users/profile'
 * ```
 */
export function normalizeSlashes(path: string): string {
  // Replace multiple slashes with single slash
  let normalized = path.replace(/\/{2,}/g, '/');

  // Ensure path starts with slash (unless it's just wildcard)
  if (!normalized.startsWith('/') && normalized !== '*') {
    normalized = '/' + normalized;
  }

  // Remove trailing slash unless it's root
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }

  return normalized;
}

/**
 * Safely decode a URI component, returning the original value if decoding fails.
 */
function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    // If decoding fails (malformed URI), return the original value
    return value;
  }
}

/**
 * Parse query string into object.
 * Supports multiple values for the same key by returning arrays.
 *
 * @param search - Query string (with or without ?)
 * @returns Parsed query parameters
 *
 * @example
 * ```typescript
 * parseSearch('?page=1&sort=asc'); // { page: '1', sort: 'asc' }
 * parseSearch('?tags=react&tags=vue'); // { tags: ['react', 'vue'] }
 * ```
 */
export function parseSearch(search: string): Record<string, string | string[]> {
  const result: Record<string, string | string[]> = {};

  if (!search) {
    return result;
  }

  // Remove leading ? if present
  const queryString = search.startsWith('?') ? search.slice(1) : search;

  if (!queryString) {
    return result;
  }

  const pairs = queryString.split('&');

  for (const pair of pairs) {
    const [key, ...valueParts] = pair.split('=');
    const value = valueParts.join('='); // Handle values that contain =

    if (!key) continue;

    const decodedKey = safeDecodeURIComponent(key);
    const decodedValue = value ? safeDecodeURIComponent(value) : '';

    if (decodedKey in result) {
      // Key already exists, convert to array or append to existing array
      const existing = result[decodedKey];
      if (Array.isArray(existing)) {
        existing.push(decodedValue);
      } else {
        result[decodedKey] = [existing, decodedValue];
      }
    } else {
      result[decodedKey] = decodedValue;
    }
  }

  return result;
}

/**
 * Stringify object into query string.
 * Handles array values properly.
 *
 * @param params - Parameters to stringify
 * @returns Query string (without ?)
 *
 * @example
 * ```typescript
 * stringifySearch({ page: '1', sort: 'asc' }); // 'page=1&sort=asc'
 * stringifySearch({ tags: ['react', 'vue'] }); // 'tags=react&tags=vue'
 * ```
 */
export function stringifySearch(params: Record<string, string | string[]>): string {
  const pairs: string[] = [];

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) {
      continue;
    }

    const encodedKey = encodeURIComponent(key);

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== undefined && item !== null) {
          pairs.push(`${encodedKey}=${encodeURIComponent(item)}`);
        }
      }
    } else {
      pairs.push(`${encodedKey}=${encodeURIComponent(value)}`);
    }
  }

  return pairs.join('&');
}

/**
 * Remove base path from a pathname.
 *
 * @param pathname - Full pathname
 * @param basePath - Base path to remove
 * @returns Pathname without base
 *
 * @example
 * ```typescript
 * stripBasePath('/app/users', '/app'); // '/users'
 * ```
 */
export function stripBasePath(pathname: string, basePath: string): string {
  if (!basePath || basePath === '/') {
    return pathname;
  }

  const normalizedBase = normalizeSlashes(basePath);

  if (pathname.startsWith(normalizedBase)) {
    return pathname.slice(normalizedBase.length) || '/';
  }

  return pathname;
}

/**
 * Add base path to a pathname.
 *
 * @param pathname - Pathname to prefix
 * @param basePath - Base path to add
 * @returns Full pathname with base
 *
 * @example
 * ```typescript
 * addBasePath('/users', '/app'); // '/app/users'
 * ```
 */
export function addBasePath(pathname: string, basePath: string): string {
  if (!basePath || basePath === '/') {
    return pathname;
  }

  return normalizeSlashes(joinPaths(basePath, pathname));
}
