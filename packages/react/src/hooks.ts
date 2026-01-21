/**
 * React hooks for routing.
 * @packageDocumentation
 */

import { useCallback, useEffect, useState } from 'react';
import type { Route, RouteRef, NavigateOptions } from '@oxog/routely-core';
import { useRouterContext } from './context.js';
import type { NavigateFunction } from './types.js';
import { stringifySearch } from '@oxog/routely-core';

/**
 * Hook to get navigation function.
 *
 * @returns Navigate function
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const navigate = useNavigate();
 *   return <button onClick={() => navigate('/users')}>Users</button>;
 * }
 * ```
 */
export function useNavigate(): NavigateFunction {
  const { router } = useRouterContext();

  return useCallback(
    ((to: string | number | RouteRef, options?: NavigateOptions) => {
      if (typeof to === 'number') {
        router.go(to);
      } else {
        // Handle navigation errors gracefully
        const result = router.navigate(to, options);
        if (result && typeof result.catch === 'function') {
          result.catch((error: Error) => {
            console.error('Navigation failed:', error);
          });
        }
      }
    }) as NavigateFunction,
    [router]
  );
}

/**
 * Hook to get route parameters.
 *
 * @returns Route parameters
 *
 * @example
 * ```tsx
 * function UserDetail() {
 *   const { id } = useParams<{ id: string }>();
 *   return <div>User {id}</div>;
 * }
 * ```
 */
export function useParams<T extends Record<string, string> = Record<string, string>>(): T {
  const { currentRoute } = useRouterContext();
  if (!currentRoute) {
    throw new Error('useParams called but no route is currently matched');
  }
  return currentRoute.params as T;
}

/**
 * Hook to get current route.
 *
 * @returns Current route
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const route = useRoute();
 *   return <div>Current path: {route.path}</div>;
 * }
 * ```
 */
export function useRoute(): Route {
  const { currentRoute } = useRouterContext();
  if (!currentRoute) {
    throw new Error('useRoute called but no route is currently matched');
  }
  return currentRoute;
}

/**
 * Hook to get search params with setter.
 *
 * @returns Search params and setter function
 *
 * @example
 * ```tsx
 * function Products() {
 *   const [search, setSearch] = useSearch();
 *   return (
 *     <div>
 *       <input
 *         value={search.q || ''}
 *         onChange={(e) => setSearch({ ...search, q: e.target.value })}
 *       />
 *     </div>
 *   );
 * }
 * ```
 */
export function useSearch<T extends Record<string, string | string[]> = Record<string, string | string[]>>():
  [T, (value: T | ((prev: T) => T)) => void]
{
  const { router, currentRoute } = useRouterContext();
  const [search, setSearch] = useState<T>(currentRoute?.search as T ?? {} as T);

  // Update search when currentRoute changes
  useEffect(() => {
    if (currentRoute) {
      setSearch(currentRoute.search as T);
    }
  }, [currentRoute]);

  const updateSearch = useCallback((value: T | ((prev: T) => T)) => {
    const newValue = typeof value === 'function' ? (value as (prev: T) => T)(search) : value;

    // Update URL with new search params
    const searchStr = stringifySearch(newValue);
    const currentPath = router.history.location.pathname;
    const newPath = `${currentPath}?${searchStr}${router.history.location.hash}`;

    void router.navigate(newPath, { replace: true });
  }, [router, search]);

  return [search, updateSearch];
}
