/**
 * React components for routing.
 * @packageDocumentation
 */

import type { ReactElement } from 'react';
import { Component } from 'react';
import { useNavigate } from './hooks.js';
import { useRouterContext } from './context.js';
import { matchRoute, MAX_HREF_LENGTH, pathToRegex, normalizeSlashes } from '@oxog/routely-core';
import type { LinkProps } from './types.js';

/**
 * Validate and sanitize href to prevent XSS attacks.
 * @internal
 */
function validateHref(href: string): string {
  // Check type
  if (typeof href !== 'string') {
    throw new TypeError('Href must be a string');
  }

  // Check length
  if (href.length > MAX_HREF_LENGTH) {
    throw new Error(`Href too long (max ${MAX_HREF_LENGTH} characters)`);
  }

  // Must start with / for relative links, or be #, ?, or *
  if (!href.startsWith('/') && href !== '#' && !href.startsWith('?') && href !== '*') {
    throw new Error(`Invalid href: "${href}" - must start with "/" or be "#", "?", or "*"`);
  }

  // Check for dangerous protocols (javascript:, data:, vbscript:, file:)
  const dangerousProtocols = /^(javascript|data|vbscript|file|about):/i;
  if (dangerousProtocols.test(href)) {
    throw new Error(`Dangerous href protocol detected: "${href}"`);
  }

  // Check for HTML tag injection attempts
  if (href.includes('<') || href.includes('>')) {
    throw new Error(`Invalid href: contains HTML brackets`);
  }

  // Check for event handler injection
  if (/on\w+\s*=/i.test(href)) {
    throw new Error(`Invalid href: contains event handler`);
  }

  // Check for null bytes (path traversal)
  if (href.includes('\0')) {
    throw new Error('Invalid href: contains null byte');
  }

  // Check for control characters
  if (/[\x00-\x1F\x7F]/.test(href)) {
    throw new Error('Invalid href: contains control characters');
  }

  return href;
}

/**
 * Check if a link href matches the current route.
 * Handles both static and dynamic routes properly.
 * Optimized to avoid unnecessary loops.
 * @internal
 */
function isLinkActive(href: string, currentPath: string): boolean {
  // Normalize both paths for comparison
  const normalizedHref = normalizeSlashes(href);
  const normalizedCurrent = normalizeSlashes(currentPath);

  // First try exact match for static routes (fast path)
  if (normalizedHref === normalizedCurrent) {
    return true;
  }

  // Check if href is a dynamic route pattern (contains : or *)
  const isDynamicPattern = /[:*]/.test(normalizedHref);

  if (isDynamicPattern) {
    // For dynamic route patterns, check if current path matches this pattern
    const regex = pathToRegex(normalizedHref);
    return regex.test(normalizedCurrent);
  }

  // For static routes, no match
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
  const { currentRoute } = useRouterContext();

  // Get href and validate for XSS prevention
  const rawHref = typeof to === 'string' ? to : to.path;
  const href = validateHref(rawHref);
  const isActive = currentRoute && isLinkActive(href, currentRoute.path);

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
 *
 * @example
 * ```tsx
 * function UserDetail({ params, search }: OutletProps) {
 *   const { id } = params; // Type: string
 *   const page = search.page; // Type: string | string[] | undefined
 *   return <div>User {id}</div>;
 * }
 * ```
 */
export interface OutletProps {
  /** Matched route parameters */
  params: Record<string, string>;
  /** Parsed search/query parameters */
  search: Record<string, string | string[] | undefined>;
  /** URL hash (without #) */
  hash: string;
  /** State data passed during navigation */
  state: unknown;
  /** Route metadata */
  meta: Record<string, unknown>;
}

/**
 * Internal error boundary for Outlet component.
 * @internal
 */
class OutletErrorBoundary extends Component<
  { children: ReactElement; fallback?: ReactElement },
  { hasError: boolean }
> {
  constructor(props: { children: ReactElement; fallback?: ReactElement }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error): { hasError: boolean } {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Outlet component error:', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

/**
 * Check if we're in development mode.
 */
const isDevelopment = typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';

/**
 * Props signature checker for route components.
 * @internal
 */
function getComponentPropLength(component: unknown): number {
  try {
    // Try to get the component's length (number of parameters)
    if (typeof component === 'function') {
      // Function components have a length property
      return component.length;
    }
    // Class components - check if they accept props
    if (component && typeof component === 'object' && 'prototype' in component) {
      return 1; // Class components always accept props
    }
  } catch {
    // If we can't determine, assume it accepts props
  }
  return 1;
}

/**
 * Outlet component for rendering nested routes.
 * Includes error boundary to catch component rendering errors.
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

  const Component = match.route.component as React.ComponentType<OutletProps>;

  // In development, check if component properly handles props
  if (isDevelopment) {
    const propLength = getComponentPropLength(Component);
    if (propLength === 0) {
      console.warn(
        `Route component for "${currentRoute.path}" appears to not accept props. ` +
        `Route components should accept props: params, search, hash, state, meta. ` +
        `Consider updating your component signature.`
      );
    }
  }

  // Pass props to the component
  const outletProps: OutletProps = {
    params: currentRoute.params,
    search: currentRoute.search,
    hash: currentRoute.hash,
    state: currentRoute.state,
    meta: currentRoute.meta,
  };

  // Wrap with error boundary to catch component rendering errors
  return (
    <OutletErrorBoundary>
      <Component {...outletProps} />
    </OutletErrorBoundary>
  );
}
