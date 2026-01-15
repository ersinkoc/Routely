/**
 * Routely Lazy Plugin - Lazy loading and code splitting support.
 * @packageDocumentation
 */

import type { RouterPlugin } from '@oxog/routely-core';
import type { Router } from '@oxog/routely-core';
import React, {
  ComponentType,
  LazyExoticComponent,
  createElement,
  lazy as reactLazy,
  Component,
} from 'react';

/**
 * Options for configuring the lazy plugin.
 *
 * @example
 * ```typescript
 * router.use(lazyPlugin({
 *   fallback: createElement('div', {}, 'Loading...'),
 *   timeout: 10000,
 * }));
 * ```
 */
export interface LazyPluginOptions {
  /**
   * Global fallback component to show while loading lazy routes.
   * Can be overridden per-route using the lazy() options.
   */
  fallback?: React.ReactNode;
  /**
   * Maximum time to wait for a lazy component to load (in milliseconds).
   * After this time, the error boundary will be triggered.
   * @default 10000 (10 seconds)
   */
  timeout?: number;
  /**
   * Error component to show when a lazy component fails to load.
   */
  error?: ComponentType<{ error: Error; retry: () => void }>;
}

/**
 * Options for individual lazy routes.
 *
 * @example
 * ```typescript
 * route('/dashboard', lazy(() => import('./Dashboard'), {
 *   fallback: createElement(Loader),
 *   timeout: 5000,
 * }));
 * ```
 */
export interface LazyRouteOptions {
  /**
   * Fallback component for this specific route.
   * Overrides the global fallback from lazyPlugin().
   */
  fallback?: React.ReactNode;
  /**
   * Timeout in milliseconds for this specific route.
   * Overrides the global timeout from lazyPlugin().
   */
  timeout?: number;
}

/**
 * Default error component.
 *
 * @example
 * ```typescript
 * // Use as default or custom error component
 * router.use(lazyPlugin({
 *   error: DefaultErrorFallback,
 * }));
 * ```
 */
export function DefaultErrorFallback({ error, retry }: { error: Error; retry: () => void }) {
  return createElement(
    'div',
    { style: { padding: '20px', textAlign: 'center' } },
    createElement('h2', {}, 'Failed to load page'),
    createElement('p', {}, error.message),
    createElement(
      'button',
      {
        onClick: retry,
        type: 'button',
      },
      'Retry'
    )
  );
}

/**
 * Default loading component.
 *
 * @example
 * ```typescript
 * // Use as default or custom fallback
 * router.use(lazyPlugin({
 *   fallback: createElement(DefaultLoadingFallback),
 * }));
 * ```
 */
export function DefaultLoadingFallback() {
  return createElement('div', {}, 'Loading...');
}

/**
 * Error boundary for lazy loaded components.
 *
 * @example
 * ```typescript
 * // Wrap your lazy components with this error boundary
 * createElement(LazyErrorBoundary, {
 *   ErrorComponent: CustomErrorComponent,
 *   onRetry: () => window.location.reload(),
 * }, lazyComponent)
 * ```
 */
export class LazyErrorBoundary extends Component<
  {
    children: React.ReactNode;
    ErrorComponent?: ComponentType<{ error: Error; retry: () => void }>;
    onRetry?: () => void;
  },
  { hasError: boolean; error: Error | null }
> {
  constructor(
    props: {
      children: React.ReactNode;
      ErrorComponent?: ComponentType<{ error: Error; retry: () => void }>;
      onRetry?: () => void;
    }
  ) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  override render(): React.ReactNode {
    if (this.state.hasError && this.state.error) {
      const ErrorComponent = this.props.ErrorComponent || DefaultErrorFallback;
      return createElement(ErrorComponent, {
        error: this.state.error,
        retry: () => {
          this.setState({ hasError: false, error: null });
          this.props.onRetry?.();
        },
      });
    }

    return this.props.children;
  }
}

/**
 * Create a lazy component with timeout support.
 *
 * @example
 * ```typescript
 * const Dashboard = createLazyWithTimeout(
 *   () => import('./Dashboard'),
 *   5000 // 5 second timeout
 * );
 * ```
 */
export function createLazyWithTimeout<T extends ComponentType>(
  lazyFn: () => Promise<{ default: T }>,
  timeout: number
): LazyExoticComponent<T> {
  const lazyComponent = reactLazy(() => {
    return Promise.race([
      lazyFn(),
      new Promise<{ default: T }>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Component load timeout after ${timeout}ms`)),
          timeout
        )
      ),
    ]);
  });

  // Attach metadata for consistency with the lazy() function
  (lazyComponent as any)[LAZY_COMPONENT_SYMBOL] = true;
  (lazyComponent as any)[LAZY_OPTIONS_SYMBOL] = { timeout };

  return lazyComponent;
}

/**
 * Global plugin options (stored on the router).
 */
const LAZY_PLUGIN_OPTIONS = Symbol.for('lazy-plugin-options');

/**
 * Symbol used to mark lazy components.
 */
const LAZY_COMPONENT_SYMBOL = Symbol.for('routely.lazy');
const LAZY_OPTIONS_SYMBOL = Symbol.for('routely.lazy.options');

/**
 * Wrap a component to make it lazy-loadable.
 *
 * This function wraps React.lazy() with additional features:
 * - Custom fallback per route
 * - Timeout handling
 * - Metadata for plugin detection
 *
 * @param loader - Function that returns a Promise for the component
 * @param options - Optional route-specific options
 * @returns A component with lazy metadata attached
 *
 * @example
 * ```typescript
 * // Basic usage
 * const Dashboard = lazy(() => import('./Dashboard'));
 *
 * // With custom fallback
 * const Settings = lazy(() => import('./Settings'), {
 *   fallback: createElement(SettingsLoader),
 * });
 *
 * // With timeout
 * const Admin = lazy(() => import('./Admin'), {
 *   timeout: 5000, // 5 seconds
 * });
 * ```
 */
export function lazy<T extends ComponentType>(
  loader: () => Promise<{ default: T }>,
  options: LazyRouteOptions = {}
): T {
  const lazyComponent = reactLazy(loader);

  // Attach metadata to the component for the plugin to detect
  (lazyComponent as any)[LAZY_COMPONENT_SYMBOL] = true;
  (lazyComponent as any)[LAZY_OPTIONS_SYMBOL] = options;

  return lazyComponent as unknown as T;
}

/**
 * Check if a component is a lazy component created by the lazy() function.
 *
 * @example
 * ```typescript
 * if (isLazyComponent(component)) {
 *   const options = getLazyComponentOptions(component);
 *   console.log('Fallback:', options?.fallback);
 * }
 * ```
 */
export function isLazyComponent(component: any): component is ComponentType & { [key: symbol]: any } {
  return Boolean(component && component[LAZY_COMPONENT_SYMBOL] === true);
}

/**
 * Get lazy options from a component.
 *
 * @example
 * ```typescript
 * const Dashboard = lazy(() => import('./Dashboard'), {
 *   fallback: createElement(Loader),
 *   timeout: 5000,
 * });
 *
 * const options = getLazyComponentOptions(Dashboard);
 * // options = { fallback: ..., timeout: 5000 }
 * ```
 */
export function getLazyComponentOptions(component: any): LazyRouteOptions | undefined {
  if (isLazyComponent(component)) {
    return component[LAZY_OPTIONS_SYMBOL];
  }
  return undefined;
}

/**
 * Create the lazy plugin instance.
 *
 * This plugin enables lazy loading of route components with:
 * - Metadata storage for lazy component detection
 * - Global configuration for fallback and timeout
 * - Error boundary support
 *
 * @param options - Plugin configuration options
 * @returns A router plugin for lazy loading
 *
 * @example
 * ```typescript
 * import { lazyPlugin, lazy } from '@oxog/routely/plugin-lazy';
 *
 * // Register the plugin
 * router.use(lazyPlugin({
 *   fallback: createElement(GlobalLoader),
 *   timeout: 10000,
 *   error: ErrorFallback,
 * }));
 *
 * // Define lazy routes
 * const routes = [
 *   route('/', Home),
 *   route('/dashboard', lazy(() => import('./Dashboard'))),
 *   route('/settings', lazy(() => import('./Settings')), {
 *     fallback: createElement(SettingsLoader),
 *   }),
 * ];
 * ```
 */
export function lazyPlugin(options: LazyPluginOptions = {}): RouterPlugin {
  return {
    name: 'lazy',
    version: '1.0.0',

    install(router: Router) {
      // Store options on the router for later access
      (router as any)[LAZY_PLUGIN_OPTIONS] = options;
    },
  };
}
