/**
 * Routely - The router that respects your bundle.
 * @packageDocumentation
 */

// Re-export everything from core
export * from '@oxog/routely-core';

// React-specific exports
export { RouterProvider } from './provider.js';
export { Link, Outlet } from './components.js';
export { useNavigate, useParams, useRoute } from './hooks.js';
export { useRouterContext } from './context.js';

// React-specific types
export type {
  RouterProviderProps,
  LinkProps,
  NavigateFunction,
  UseSearchReturn,
} from './types.js';
