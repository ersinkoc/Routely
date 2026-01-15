/**
 * React context for router.
 * @packageDocumentation
 */

import { createContext, useContext } from 'react';
import type { Router, Route } from '@oxog/routely-core';

/**
 * Router context value.
 */
export interface RouterContextValue {
  router: Router;
  currentRoute: Route | null;
}

/**
 * Router context.
 */
export const RouterContext = createContext<RouterContextValue | null>(null);

/**
 * Use router context.
 * @throws If used outside RouterProvider
 */
export function useRouterContext(): RouterContextValue {
  const context = useContext(RouterContext);

  if (!context) {
    throw new Error('useRouterContext must be used within RouterProvider');
  }

  return context;
}
