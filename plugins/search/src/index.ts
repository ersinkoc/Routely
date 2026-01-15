/**
 * Routely Search Plugin - Type-safe search/query parameters.
 * @packageDocumentation
 */

import type { RouterPlugin, Router } from '@oxog/routely-core';
import { useContext, createContext, useCallback, useState, useEffect, createElement, type ReactNode } from 'react';

/**
 * Search parameters as a string (e.g., "?page=1&sort=asc").
 *
 * @example
 * ```typescript
 * const search = "?page=1&sort=asc";
 * ```
 */
export type SearchString = string;

/**
 * Parsed search parameters.
 *
 * @example
 * ```typescript
 * const params: SearchParams = { page: '1', sort: 'asc' };
 * ```
 */
export type SearchParams = Record<string, string>;

/**
 * Function to parse a search string into parameters.
 *
 * @example
 * ```typescript
 * const parse: SearchParser = (search) => {
 *   const params = new URLSearchParams(search);
 *   return Object.fromEntries(params);
 * };
 * ```
 */
export type SearchParser = (search: SearchString) => SearchParams;

/**
 * Function to stringify parameters into a search string.
 *
 * @example
 * ```typescript
 * const stringify: SearchStringifier = (params) => {
 *   return new URLSearchParams(params).toString();
 * };
 * ```
 */
export type SearchStringifier = (params: SearchParams) => SearchString;

/**
 * Options for configuring the search plugin.
 *
 * @example
 * ```typescript
 * router.use(searchPlugin({
 *   parse: (search) => new URLSearchParams(search),
 *   stringify: (params) => params.toString(),
 * }));
 * ```
 */
export interface SearchPluginOptions {
  /**
   * Custom parser for search strings.
   * @default (search) => Object.fromEntries(new URLSearchParams(search))
   */
  parse?: SearchParser;
  /**
   * Custom stringifier for search parameters.
   * @default (params) => new URLSearchParams(params).toString()
   */
  stringify?: SearchStringifier;
}

/**
 * Default parser using URLSearchParams.
 */
function defaultParse(search: SearchString): SearchParams {
  const params = new URLSearchParams(search);
  const result: SearchParams = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
}

/**
 * Default stringifier using URLSearchParams.
 */
function defaultStringify(params: SearchParams): SearchString {
  return new URLSearchParams(params).toString();
}

/**
 * Global plugin options (stored on the router).
 */
const SEARCH_PLUGIN_OPTIONS = Symbol.for('search-plugin-options');

/**
 * Context for search state.
 */
const SearchContext = createContext<{
  search: SearchParams;
  setSearch: (params: SearchParams | ((prev: SearchParams) => SearchParams)) => void;
} | null>(null);

/**
 * Updater function for setSearch.
 *
 * @example
 * ```typescript
 * const updater: SearchUpdater = (prev) => ({
 *   ...prev,
 *   page: String(Number(prev.page) + 1),
 * });
 * ```
 */
export type SearchUpdater = (prev: SearchParams) => SearchParams;

/**
 * React hook for accessing and updating search parameters.
 *
 * @example
 * ```typescript
 * interface PageSearch {
 *   page: string;
 *   sort: 'asc' | 'desc';
 *   filter: string;
 * }
 *
 * function PageComponent() {
 *   const { search, setSearch } = useSearch<PageSearch>();
 *
 *   console.log(search.page); // type-safe access
 *
 *   const nextPage = () => {
 *     setSearch(prev => ({
 *       ...prev,
 *       page: String(Number(prev.page) + 1),
 *     }));
 *   };
 *
 *   return (
 *     <button onClick={() => setSearch({ page: '1' })}>
 *       Page 1
 *     </button>
 *   );
 * }
 * ```
 */
export function useSearch<T extends SearchParams = SearchParams>(): {
  /**
   * Current search parameters with type-safe access.
   */
  search: T;
  /**
   * Update search parameters.
   * Can accept a new params object or an updater function.
   */
  setSearch: (params: T | ((prev: T) => T)) => void;
} {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a RouterProvider with searchPlugin installed');
  }
  return context as unknown as {
    search: T;
    setSearch: (params: T | ((prev: T) => T)) => void;
  };
}

/**
 * Provider component for search context.
 */
export function SearchProvider({
  children,
  initialSearch,
  parse,
  stringify,
  onSearchChange,
}: {
  children: ReactNode;
  initialSearch: SearchString;
  parse: SearchParser;
  stringify: SearchStringifier;
  onSearchChange: (search: SearchString) => void;
}) {
  const [search, setSearch] = useState(() => parse(initialSearch));

  const updateSearch = useCallback(
    (params: SearchParams | SearchUpdater) => {
      setSearch((prev) => {
        const newParams = typeof params === 'function' ? (params as SearchUpdater)(prev) : params;
        const searchString = stringify(newParams);
        onSearchChange(searchString);
        return newParams;
      });
    },
    [parse, stringify, onSearchChange]
  );

  // Update internal state when initialSearch changes from outside
  useEffect(() => {
    setSearch(parse(initialSearch));
  }, [initialSearch, parse]);

  return createElement(
    SearchContext.Provider,
    { value: { search, setSearch: updateSearch } },
    children
  );
}

/**
 * Create the search plugin instance.
 *
 * This plugin enables type-safe search/query parameters with:
 * - Type-safe access to search params via useSearch<T>() hook
 * - Custom parse/stringify functions
 * - Updater function support for setSearch
 * - React context integration
 *
 * @param options - Plugin configuration options
 * @returns A router plugin for search parameters
 *
 * @example
 * ```typescript
 * import { searchPlugin, useSearch } from '@oxog/routely/plugin-search';
 *
 * router.use(searchPlugin({
 *   parse: (search) => {
 *     const params = new URLSearchParams(search);
 *     return Object.fromEntries(params);
 *   },
 *   stringify: (params) => {
 *     return new URLSearchParams(params).toString();
 *   },
 * }));
 *
 * // In a component
 * function PageComponent() {
 *   const { search, setSearch } = useSearch<{
 *     page: string;
 *     sort: 'asc' | 'desc';
 *   }>();
 *
 *   return (
 *     <div>
 *       <p>Page: {search.page}</p>
 *       <button onClick={() => setSearch({ ...search, page: '2' })}>
 *         Next
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function searchPlugin(options: SearchPluginOptions = {}): RouterPlugin {
  const parse = options.parse || defaultParse;
  const stringify = options.stringify || defaultStringify;

  return {
    name: 'search',
    version: '1.0.0',

    install(router: Router) {
      // Store options on the router for later access
      (router as any)[SEARCH_PLUGIN_OPTIONS] = {
        parse,
        stringify,
        SearchProvider,
      };
    },
  };
}

/**
 * Get the search plugin options from a router.
 *
 * @example
 * ```typescript
 * const options = getSearchPluginOptions(router);
 * console.log(options.parse);
 * ```
 */
export function getSearchPluginOptions(router: Router): {
  parse: SearchParser;
  stringify: SearchStringifier;
  SearchProvider: typeof SearchProvider;
} | undefined {
  return (router as any)[SEARCH_PLUGIN_OPTIONS];
}

/**
 * Parse a search string using the plugin's parser.
 *
 * @example
 * ```typescript
 * const params = parseSearch('?page=1&sort=asc');
 * // { page: '1', sort: 'asc' }
 * ```
 */
export function parseSearch(search: SearchString): SearchParams {
  return defaultParse(search);
}

/**
 * Stringify search parameters using the plugin's stringifier.
 *
 * @example
 * ```typescript
 * const search = stringifySearch({ page: '1', sort: 'asc' });
 * // 'page=1&sort=asc'
 * ```
 */
export function stringifySearch(params: SearchParams): SearchString {
  return defaultStringify(params);
}
