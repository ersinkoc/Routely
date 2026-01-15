/**
 * RouterProvider component.
 * @packageDocumentation
 */

import { useState, useEffect, useMemo } from 'react';
import type { Route } from '@oxog/routely-core';
import { RouterContext } from './context.js';
import type { RouterProviderProps } from './types.js';

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
  const [currentRoute, setCurrentRoute] = useState<Route | null>(router.currentRoute);

  useEffect(() => {
    const unsubscribe = router.on('afterNavigate', (route: Route) => {
      setCurrentRoute(route);
    });

    // Set initial route if available
    if (router.currentRoute) {
      setCurrentRoute(router.currentRoute);
    }

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
