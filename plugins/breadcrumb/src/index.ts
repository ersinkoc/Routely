/**
 * Routely Breadcrumb Plugin - Type-safe breadcrumb navigation.
 * @packageDocumentation
 */

import type { RouterPlugin, Router, Route } from '@oxog/routely-core';
import { useContext, createContext, useState, useEffect, createElement, type ReactNode } from 'react';

/**
 * A single breadcrumb item.
 *
 * @example
 * ```typescript
 * const breadcrumb: BreadcrumbItem = {
 *   path: '/users',
 *   label: 'Users',
 *   route: { path: '/users', params: {} }
 * };
 * ```
 */
export interface BreadcrumbItem {
  /** The path for this breadcrumb */
  path: string;
  /** The display label for this breadcrumb */
  label: string;
  /** The route object for this breadcrumb */
  route: Route | null;
}

/**
 * Function to generate a label for a breadcrumb.
 *
 * @example
 * ```typescript
 * const labelFn: BreadcrumbLabelFunction = (route, path) => {
 *   if (route?.meta?.breadcrumb) {
 *     return route.meta.breadcrumb;
 *   }
 *   return path.split('/').pop() || 'Home';
 * };
 * ```
 */
export type BreadcrumbLabelFunction = (route: Route | null, path: string) => string;

/**
 * Options for configuring the breadcrumb plugin.
 *
 * @example
 * ```typescript
 * router.use(breadcrumbPlugin({
 *   label: (route, path) => route?.meta?.title || path,
 *   homeLabel: 'Home',
 *   separator: '/'
 * }));
 * ```
 */
export interface BreadcrumbPluginOptions {
  /**
   * Custom function to generate breadcrumb labels.
   * @default (route, path) => route?.meta?.breadcrumb || route?.meta?.title || path
   */
  label?: BreadcrumbLabelFunction;
  /**
   * Label for the home/root breadcrumb.
   * @default 'Home'
   */
  homeLabel?: string;
  /**
   * Separator to display between breadcrumbs (UI hint, not rendered by plugin).
   * @default '/'
   */
  separator?: string;
  /**
   * Whether to include the root path in breadcrumbs.
   * @default true
   */
  includeHome?: boolean;
}

/**
 * Default label function using route metadata.
 */
function defaultLabel(route: Route | null, path: string): string {
  if (route?.meta) {
    const meta = route.meta as Record<string, unknown>;
    if (typeof meta.breadcrumb === 'string') {
      return meta.breadcrumb;
    }
    if (typeof meta.title === 'string') {
      return meta.title;
    }
  }
  // Generate label from path
  const segments = path.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  return lastSegment || 'Home';
}

/**
 * Global plugin options (stored on the router).
 */
const BREADCRUMB_PLUGIN_OPTIONS = Symbol.for('breadcrumb-plugin-options');

/**
 * Context for breadcrumb state.
 */
const BreadcrumbContext = createContext<{
  breadcrumbs: BreadcrumbItem[];
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
} | null>(null);

/**
 * React hook for accessing breadcrumb navigation.
 *
 * @example
 * ```typescript
 * function BreadcrumbComponent() {
 *   const { breadcrumbs } = useBreadcrumbs();
 *
 *   return (
 *     <nav>
 *       {breadcrumbs.map((crumb, index) => (
 *         <span key={crumb.path}>
 *           <a href={crumb.path}>{crumb.label}</a>
 *           {index < breadcrumbs.length - 1 && ' / '}
 *         </span>
 *       ))}
 *     </nav>
 *   );
 * }
 * ```
 */
export function useBreadcrumbs(): {
  /** Current breadcrumb items */
  breadcrumbs: BreadcrumbItem[];
  /** Update breadcrumb items (usually not needed, breadcrumbs auto-update) */
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
} {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error('useBreadcrumbs must be used within a RouterProvider with breadcrumbPlugin installed');
  }
  return context;
}

/**
 * Generate breadcrumbs from a path.
 */
function generateBreadcrumbs(
  path: string,
  routes: Route[],
  labelFn: BreadcrumbLabelFunction,
  homeLabel: string,
  includeHome: boolean
): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [];
  const segments = path.split('/').filter(Boolean);

  // Add home if included
  if (includeHome) {
    const homeRoute = routes.find((r) => r.path === '/');
    breadcrumbs.push({
      path: '/',
      label: homeRoute ? labelFn(homeRoute, '/') : homeLabel,
      route: homeRoute || null,
    });
  }

  // Build path incrementally
  let currentPath = '';
  for (let i = 0; i < segments.length; i++) {
    currentPath += '/' + segments[i];

    // Find matching route
    const matchingRoute = routes.find((r) => {
      // Exact match
      if (r.path === currentPath) return true;
      // Handle dynamic routes like /users/:id
      const routeSegments = r.path.split('/').filter(Boolean);
      if (routeSegments.length !== i + 1) return false;

      for (let j = 0; j < routeSegments.length; j++) {
        const routeSeg = routeSegments[j];
        const pathSeg = segments[j];
        if (!routeSeg || !pathSeg) return false;
        // Dynamic segment starts with :
        if (routeSeg.startsWith(':')) continue;
        if (routeSeg !== pathSeg) return false;
      }
      return true;
    });

    // Create params for dynamic routes
    const params: Record<string, string> = {};
    if (matchingRoute) {
      const routeSegments = matchingRoute.path.split('/').filter(Boolean);
      for (let j = 0; j < routeSegments.length; j++) {
        const routeSeg = routeSegments[j];
        if (routeSeg && routeSeg.startsWith(':')) {
          const paramName = routeSeg.slice(1);
          const segmentValue = segments[j];
          if (segmentValue !== undefined) {
            params[paramName] = segmentValue;
          }
        }
      }
    }

    breadcrumbs.push({
      path: currentPath,
      label: labelFn(
        matchingRoute ? { ...matchingRoute, params } : null,
        currentPath
      ),
      route: matchingRoute ? { ...matchingRoute, params } : null,
    });
  }

  return breadcrumbs;
}

/**
 * Provider component for breadcrumb context.
 */
export function BreadcrumbProvider({
  children,
  initialPath,
  routes,
  label,
  homeLabel,
  includeHome,
}: {
  children: ReactNode;
  initialPath: string;
  routes: Route[];
  label: BreadcrumbLabelFunction;
  homeLabel: string;
  includeHome: boolean;
}) {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>(() =>
    generateBreadcrumbs(initialPath, routes, label, homeLabel, includeHome)
  );

  // Update breadcrumbs when path changes
  useEffect(() => {
    setBreadcrumbs(generateBreadcrumbs(initialPath, routes, label, homeLabel, includeHome));
  }, [initialPath, routes, label, homeLabel, includeHome]);

  return createElement(
    BreadcrumbContext.Provider,
    { value: { breadcrumbs, setBreadcrumbs } },
    children
  );
}

/**
 * Create the breadcrumb plugin instance.
 *
 * This plugin enables breadcrumb navigation with:
 * - Automatic breadcrumb generation from route hierarchy
 * - Custom label functions for flexible breadcrumb labels
 * - React context integration via useBreadcrumbs() hook
 * - Support for dynamic routes (e.g., /users/:id)
 * - Route metadata support (meta.breadcrumb or meta.title)
 *
 * @param options - Plugin configuration options
 * @returns A router plugin for breadcrumb navigation
 *
 * @example
 * ```typescript
 * import { breadcrumbPlugin, useBreadcrumbs } from '@oxog/routely/plugin-breadcrumb';
 *
 * router.use(breadcrumbPlugin({
 *   label: (route, path) => {
 *     return route?.meta?.breadcrumb || path.split('/').pop() || 'Home';
 *   },
 *   homeLabel: 'Home',
 *   includeHome: true
 * }));
 *
 * // In a component
 * function BreadcrumbNav() {
 *   const { breadcrumbs } = useBreadcrumbs();
 *
 *   return (
 *     <nav aria-label="Breadcrumb">
 *       {breadcrumbs.map((crumb, index) => (
 *         <React.Fragment key={crumb.path}>
 *           <a href={crumb.path}>{crumb.label}</a>
 *           {index < breadcrumbs.length - 1 && ' > '}
 *         </React.Fragment>
 *       ))}
 *     </nav>
 *   );
 * }
 * ```
 */
export function breadcrumbPlugin(options: BreadcrumbPluginOptions = {}): RouterPlugin {
  const label = options.label || defaultLabel;
  const homeLabel = options.homeLabel ?? 'Home';
  const separator = options.separator ?? '/';
  const includeHome = options.includeHome !== false;

  return {
    name: 'breadcrumb',
    version: '1.0.0',

    install(router: Router) {
      // Store options on the router for later access
      (router as any)[BREADCRUMB_PLUGIN_OPTIONS] = {
        label,
        homeLabel,
        separator,
        includeHome,
        BreadcrumbProvider,
      };
    },
  };
}

/**
 * Get the breadcrumb plugin options from a router.
 *
 * @example
 * ```typescript
 * const options = getBreadcrumbPluginOptions(router);
 * console.log(options.label);
 * ```
 */
export function getBreadcrumbPluginOptions(router: Router): {
  label: BreadcrumbLabelFunction;
  homeLabel: string;
  separator: string;
  includeHome: boolean;
  BreadcrumbProvider: typeof BreadcrumbProvider;
} | undefined {
  return (router as any)[BREADCRUMB_PLUGIN_OPTIONS];
}

/**
 * Generate breadcrumbs from a path using the plugin's configuration.
 *
 * @example
 * ```typescript
 * const breadcrumbs = generateBreadcrumbsForPath(router, '/users/123', [
 *   { path: '/users', meta: { breadcrumb: 'Users' } },
 *   { path: '/users/:id', meta: { breadcrumb: 'User Details' } }
 * ]);
 * ```
 */
export function generateBreadcrumbsForPath(
  router: Router,
  path: string,
  routes: Route[]
): BreadcrumbItem[] {
  const options = getBreadcrumbPluginOptions(router);
  if (!options) {
    throw new Error('breadcrumbPlugin is not installed on this router');
  }

  return generateBreadcrumbs(path, routes, options.label, options.homeLabel, options.includeHome);
}
