/**
 * React hooks for routing.
 * @packageDocumentation
 */

import { useCallback, useEffect, useState, useRef } from 'react';
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
      // Runtime validation for number delta
      if (typeof to === 'number') {
        // Validate delta is finite
        if (!Number.isFinite(to)) {
          console.error('Navigation delta must be a finite number');
          return;
        }
        router.go(to);
      } else if (typeof to === 'string') {
        // Validate string target
        if (!to || to.length === 0) {
          console.error('Navigation target cannot be empty');
          return;
        }
        // Handle navigation errors gracefully
        void router.navigate(to, options).catch((error: Error) => {
          console.error('Navigation failed:', error);
        });
      } else if (to && typeof to === 'object') {
        // Handle RouteRef
        void router.navigate(to, options).catch((error: Error) => {
          console.error('Navigation failed:', error);
        });
      } else {
        console.error('Invalid navigation target:', to);
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
  const [search, setSearchState] = useState<T>(currentRoute?.search as T ?? {} as T);

  // Update search when currentRoute changes
  useEffect(() => {
    if (currentRoute) {
      setSearchState(currentRoute.search as T);
    }
  }, [currentRoute]);

  // Use ref to track pending navigation to prevent race conditions
  const navigationPendingRef = useRef(false);

  const updateSearch = useCallback((value: T | ((prev: T) => T)) => {
    // Validate input
    if (value === null || value === undefined) {
      throw new Error('useSearch update value cannot be null or undefined');
    }

    // Prevent concurrent navigation updates
    if (navigationPendingRef.current) {
      console.warn('Navigation update already in progress, ignoring concurrent update');
      return;
    }

    // Use functional update with setState to get latest value
    setSearchState((prevSearch) => {
      let newValue: T;
      try {
        newValue = typeof value === 'function' ? (value as (prev: T) => T)(prevSearch) : value;
      } catch (error) {
        console.error('Error calculating new search params:', error);
        return prevSearch; // Return previous value if calculation fails
      }

      // Update URL with new search params
      const searchStr = stringifySearch(newValue);
      const currentPath = router.history.location.pathname;
      const newPath = `${currentPath}?${searchStr}${router.history.location.hash}`;

      navigationPendingRef.current = true;

      void router.navigate(newPath, { replace: true })
        .catch((err: Error) => {
          console.error('Failed to update search params:', err);
          // Revert state on error
          setSearchState(prevSearch);
        })
        .finally(() => {
          navigationPendingRef.current = false;
        });

      // Return new value immediately (optimistic update)
      return newValue;
    });
  }, [router]);

  return [search, updateSearch];
}
