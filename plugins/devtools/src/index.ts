/**
 * Routely DevTools Plugin - Developer tools for debugging router state.
 * @packageDocumentation
 */

import type { RouterPlugin, Router, Route } from '@oxog/routely-core';
import { useContext, createContext, useState, useEffect, createElement, type ReactNode } from 'react';

/**
 * Navigation history entry.
 *
 * @example
 * ```typescript
 * const entry: HistoryEntry = {
 *   path: '/users/123',
 *   timestamp: 1234567890,
 *   type: 'navigate'
 * };
 * ```
 */
export interface HistoryEntry {
  /** The path navigated to */
  path: string;
  /** Timestamp of the navigation */
  timestamp: number;
  /** Type of navigation */
  type: 'navigate' | 'back' | 'forward' | 'go';
}

/**
 * Plugin info.
 *
 * @example
 * ```typescript
 * const info: PluginInfo = {
 *   name: 'search',
 *   version: '1.0.0',
 *   description: 'Search/query parameters plugin'
 * };
 * ```
 */
export interface PluginInfo {
  /** Plugin name */
  name: string;
  /** Plugin version */
  version: string;
  /** Plugin description (if available) */
  description?: string;
}

/**
 * Options for configuring the devtools plugin.
 *
 * @example
 * ```typescript
 * router.use(devtoolsPlugin({
 *   maxHistorySize: 50,
 *   position: 'bottom-right'
 * }));
 * ```
 */
export interface DevToolsPluginOptions {
  /**
   * Maximum number of history entries to keep.
   * @default 100
   */
  maxHistorySize?: number;
  /**
   * Position of the devtools panel (UI hint, not rendered by plugin).
   * @default 'bottom-right'
   */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /**
   * Whether to track navigation history.
   * @default true
   */
  trackHistory?: boolean;
}

/**
 * Global plugin options (stored on the router).
 */
const DEVTOOLS_PLUGIN_OPTIONS = Symbol.for('devtools-plugin-options');
const DEVTOOLS_HISTORY = Symbol.for('devtools-history');
const DEVTOOLS_PLUGINS = Symbol.for('devtools-plugins');

/**
 * Context for devtools state.
 */
const DevToolsContext = createContext<{
  history: HistoryEntry[];
  plugins: PluginInfo[];
  currentRoute: Route | null;
} | null>(null);

/**
 * React hook for accessing devtools information.
 *
 * @example
 * ```typescript
 * function DevToolsPanel() {
 *   const { history, plugins, currentRoute } = useDevTools();
 *
 *   return (
 *     <div>
 *       <h3>Current Route: {currentRoute?.path}</h3>
 *       <h4>Navigation History</h4>
 *       <ul>
 *         {history.map((entry, i) => (
 *           <li key={i}>{entry.path} - {entry.type}</li>
 *         ))}
 *       </ul>
 *       <h4>Installed Plugins</h4>
 *       <ul>
 *         {plugins.map((plugin, i) => (
 *           <li key={i}>{plugin.name} v{plugin.version}</li>
 *         ))}
 *       </ul>
 *     </div>
 *   );
 * }
 * ```
 */
export function useDevTools(): {
  /** Navigation history */
  history: HistoryEntry[];
  /** List of installed plugins */
  plugins: PluginInfo[];
  /** Current route information */
  currentRoute: Route | null;
} {
  const context = useContext(DevToolsContext);
  if (!context) {
    throw new Error('useDevTools must be used within a DevToolsProvider with devtoolsPlugin installed');
  }
  return context;
}

/**
 * Provider component for devtools context.
 */
export function DevToolsProvider({
  children,
  history,
  plugins,
  currentRoute,
}: {
  children: ReactNode;
  history: HistoryEntry[];
  plugins: PluginInfo[];
  currentRoute: Route | null;
}) {
  const [internalHistory, setInternalHistory] = useState<HistoryEntry[]>(history);
  const [internalPlugins, setInternalPlugins] = useState<PluginInfo[]>(plugins);
  const [internalCurrentRoute, setInternalCurrentRoute] = useState<Route | null>(currentRoute);

  // Update state when props change
  useEffect(() => {
    setInternalHistory(history);
  }, [history]);

  useEffect(() => {
    setInternalPlugins(plugins);
  }, [plugins]);

  useEffect(() => {
    setInternalCurrentRoute(currentRoute);
  }, [currentRoute]);

  return createElement(
    DevToolsContext.Provider,
    {
      value: {
        history: internalHistory,
        plugins: internalPlugins,
        currentRoute: internalCurrentRoute,
      },
    },
    children
  );
}

/**
 * Get navigation history from a router.
 *
 * @example
 * ```typescript
 * const history = getDevToolsHistory(router);
 * console.log(history);
 * ```
 */
export function getDevToolsHistory(router: Router): HistoryEntry[] {
  return (router as any)[DEVTOOLS_HISTORY] || [];
}

/**
 * Get list of installed plugins from a router.
 *
 * @example
 * ```typescript
 * const plugins = getDevToolsPlugins(router);
 * console.log(plugins);
 * ```
 */
export function getDevToolsPlugins(router: Router): PluginInfo[] {
  return (router as any)[DEVTOOLS_PLUGINS] || [];
}

/**
 * Get the devtools plugin options from a router.
 *
 * @example
 * ```typescript
 * const options = getDevToolsPluginOptions(router);
 * console.log(options.maxHistorySize);
 * ```
 */
export function getDevToolsPluginOptions(router: Router): {
  maxHistorySize: number;
  position: string;
  trackHistory: boolean;
  DevToolsProvider: typeof DevToolsProvider;
} | undefined {
  return (router as any)[DEVTOOLS_PLUGIN_OPTIONS];
}

/**
 * Create the devtools plugin instance.
 *
 * This plugin provides developer tools for debugging router state with:
 * - Navigation history tracking
 * - Plugin registry inspection
 * - Current route information
 * - React context integration via useDevTools() hook
 *
 * @param options - Plugin configuration options
 * @returns A router plugin for developer tools
 *
 * @example
 * ```typescript
 * import { devtoolsPlugin, useDevTools, DevToolsProvider } from '@oxog/routely/plugin-devtools';
 *
 * router.use(devtoolsPlugin({
 *   maxHistorySize: 50,
 *   position: 'bottom-right',
 *   trackHistory: true
 * }));
 *
 * // In your app
 * function App() {
 *   const options = getDevToolsPluginOptions(router);
 *
 *   return (
 *     <options.DevToolsProvider
 *       history={getDevToolsHistory(router)}
 *       plugins={getDevToolsPlugins(router)}
 *       currentRoute={router.currentRoute}
 *     >
 *       <YourApp />
 *       <DevToolsPanel />
 *     </options.DevToolsProvider>
 *   );
 * }
 *
 * // DevTools component
 * function DevToolsPanel() {
 *   const { history, plugins, currentRoute } = useDevTools();
 *
 *   return (
 *     <div style={{ position: 'fixed', bottom: 0, right: 0, background: '#fff', padding: '10px' }}>
 *       <h4>DevTools</h4>
 *       <div>Current: {currentRoute?.path}</div>
 *       <div>History: {history.length} entries</div>
 *       <div>Plugins: {plugins.length}</div>
 *     </div>
 *   );
 * }
 * ```
 */
export function devtoolsPlugin(options: DevToolsPluginOptions = {}): RouterPlugin {
  const maxHistorySize = options.maxHistorySize ?? 100;
  const position = options.position ?? 'bottom-right';
  const trackHistory = options.trackHistory !== false;

  return {
    name: 'devtools',
    version: '1.0.0',

    install(router: Router) {
      // Initialize history and plugins storage
      (router as any)[DEVTOOLS_HISTORY] = [] as HistoryEntry[];
      (router as any)[DEVTOOLS_PLUGINS] = [] as PluginInfo[];

      // Store options on the router for later access
      (router as any)[DEVTOOLS_PLUGIN_OPTIONS] = {
        maxHistorySize,
        position,
        trackHistory,
        DevToolsProvider,
      };

      // Track navigation history
      if (trackHistory) {
        const originalNavigate = router.navigate.bind(router);

        router.navigate = async (to: string, navigateOptions?: any) => {
          const result = await originalNavigate(to, navigateOptions);

          // Add to history
          const history = getDevToolsHistory(router);
          const entry: HistoryEntry = {
            path: to,
            timestamp: Date.now(),
            type: navigateOptions?.delta
              ? navigateOptions.delta < 0
                ? 'back'
                : 'forward'
              : 'navigate',
          };

          history.push(entry);

          // Trim history if needed
          if (history.length > maxHistorySize) {
            history.splice(0, history.length - maxHistorySize);
          }

          return result;
        };

        // Track back/forward/go navigation
        const originalBack = router.back.bind(router);
        router.back = () => {
          const result = originalBack();
          const history = getDevToolsHistory(router);
          history.push({
            path: router.currentRoute?.path || '',
            timestamp: Date.now(),
            type: 'back',
          });
          if (history.length > maxHistorySize) {
            history.splice(0, history.length - maxHistorySize);
          }
          return result;
        };

        const originalForward = router.forward.bind(router);
        router.forward = () => {
          const result = originalForward();
          const history = getDevToolsHistory(router);
          history.push({
            path: router.currentRoute?.path || '',
            timestamp: Date.now(),
            type: 'forward',
          });
          if (history.length > maxHistorySize) {
            history.splice(0, history.length - maxHistorySize);
          }
          return result;
        };

        const originalGo = router.go.bind(router);
        router.go = (delta: number) => {
          const result = originalGo(delta);
          const history = getDevToolsHistory(router);
          history.push({
            path: router.currentRoute?.path || '',
            timestamp: Date.now(),
            type: 'go',
          });
          if (history.length > maxHistorySize) {
            history.splice(0, history.length - maxHistorySize);
          }
          return result;
        };
      }

      // Track plugin registrations
      const originalUse = router.use.bind(router);
      router.use = function (this: Router, plugin: any) {
        const result = originalUse.call(this, plugin);

        // Add plugin to registry
        const plugins = getDevToolsPlugins(this);
        plugins.push({
          name: plugin.name || 'unknown',
          version: plugin.version || '0.0.0',
          description: plugin.description,
        });

        return result;
      };
    },
  };
}
