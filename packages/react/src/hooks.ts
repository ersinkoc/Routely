/**
 * React hooks for routing.
 * @packageDocumentation
 */

import { useCallback } from 'react';
import type { Route, RouteRef, NavigateOptions } from '@oxog/routely-core';
import { useRouterContext } from './context.js';
import type { NavigateFunction } from './types.js';

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
      } else if (typeof to === 'string') {
        router.navigate(to, options);
      } else {
        router.navigate(to, options);
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
