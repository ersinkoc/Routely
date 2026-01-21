/**
 * RouterProvider component.
 * @packageDocumentation
 */

import { useState, useMemo, useLayoutEffect } from 'react';
import type { Route } from '@oxog/routely-core';
import { RouterContext } from './context.js';
import type { RouterProviderProps } from './types.js';

// Use useLayoutEffect for browser environments, fallback to useEffect for SSR
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Router provider component.
 *
 * @example
 * ```tsx
 * <RouterProvider router={router}>
 *   <App />
 * </RouterProvider>
 * ```
 */
export function RouterProvider({ router, children }: RouterProviderProps) {
  // Initialize state with the router's current route immediately
  // This prevents an extra render cycle
  const [currentRoute, setCurrentRoute] = useState<Route | null>(() => router.currentRoute);

  // Synchronously update the route when router's currentRoute changes
  // This ensures the UI is always in sync with the router state
  useIsomorphicLayoutEffect(() => {
    const unsubscribe = router.on('afterNavigate', (route: Route) => {
      setCurrentRoute(route);
    });

    return unsubscribe;
  }, [router]);

  const value = useMemo(
    () => ({
      router,
      currentRoute,
    }),
    [router, currentRoute]
  );

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}
