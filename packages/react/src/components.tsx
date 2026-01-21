/**
 * React components for routing.
 * @packageDocumentation
 */

import type { ReactElement } from 'react';
import { useNavigate } from './hooks.js';
import { useRouterContext } from './context.js';
import { matchRoute } from '@oxog/routely-core';
import type { LinkProps } from './types.js';

/**
 * Check if a link href matches the current route.
 * Handles both static and dynamic routes properly.
 */
function isLinkActive(href: string, currentPath: string, routes: any[]): boolean {
  // First try exact match for static routes
  if (href === currentPath) {
    return true;
  }

  // For dynamic routes, check if current path matches the link's pattern
  // by matching against all routes
  for (const route of routes) {
    if (route.path === href) {
      const match = matchRoute(currentPath, [route]);
      if (match) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Link component for navigation.
 *
 * @example
 * ```tsx
 * <Link to="/users" activeClassName="active">Users</Link>
 * ```
 */
export function Link({
  to,
  children,
  activeClassName,
  replace,
  state,
  onClick,
  ...props
}: LinkProps): ReactElement {
  const navigate = useNavigate();
  const { currentRoute, router } = useRouterContext();

  const href = typeof to === 'string' ? to : to.path;
  const isActive = currentRoute && isLinkActive(href, currentRoute.path, router.routes);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Allow default behavior if:
    // - User is holding modifier key (Ctrl, Cmd, Shift, Alt)
    // - Middle click (button 1) or right click (button 2)
    // - Target is set
    if (
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      (e.button != null && e.button !== 0) ||
      props.target
    ) {
      return;
    }

    // Call onClick first - it can prevent default by calling e.preventDefault()
    if (onClick) {
      onClick(e);
    }

    // Only proceed if onClick didn't prevent default
    if (!e.defaultPrevented) {
      e.preventDefault();
      void navigate(to, { replace, state });
    }
  };

  const className = isActive && activeClassName
    ? `${props.className || ''} ${activeClassName}`.trim()
    : props.className;

  return (
    <a {...props} href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}

/**
 * Props passed to route components rendered by Outlet.
 */
export interface OutletProps {
  /** Matched route parameters */
  params: Record<string, string>;
  /** Parsed search/query parameters */
  search: Record<string, string | string[]>;
  /** URL hash (without #) */
  hash: string;
  /** State data passed during navigation */
  state: unknown;
  /** Route metadata */
  meta: Record<string, unknown>;
}

/**
 * Outlet component for rendering nested routes.
 *
 * @example
 * ```tsx
 * function Layout() {
 *   return (
 *     <div>
 *       <nav>...</nav>
 *       <main><Outlet /></main>
 *     </div>
 *   );
 * }
 * ```
 */
export function Outlet(): ReactElement | null {
  const { currentRoute, router } = useRouterContext();

  if (!currentRoute) {
    return null;
  }

  // Find the matching route using matchRoute for dynamic route support
  const match = matchRoute(currentRoute.path, router.routes);

  if (!match || !match.route.component) {
    return null;
  }

  const Component = match.route.component;

  // Pass props to the component
  const outletProps: OutletProps = {
    params: currentRoute.params,
    search: currentRoute.search,
    hash: currentRoute.hash,
    state: currentRoute.state,
    meta: currentRoute.meta,
  };

  return <Component {...outletProps} />;
}
