/**
 * React components for routing.
 * @packageDocumentation
 */

import type { ReactElement } from 'react';
import { useNavigate } from './hooks.js';
import { useRouterContext } from './context.js';
import type { LinkProps } from './types.js';

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
  const { currentRoute } = useRouterContext();

  const href = typeof to === 'string' ? to : to.path;
  const isActive = currentRoute?.path === href;

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

    e.preventDefault();

    if (onClick) {
      onClick(e);
    }

    if (!e.defaultPrevented) {
      navigate(to, { replace, state });
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

  const matchedRoute = router.routes.find((r) => r.path === currentRoute.path);

  if (!matchedRoute || !matchedRoute.component) {
    return null;
  }

  const Component = matchedRoute.component;

  return <Component />;
}
