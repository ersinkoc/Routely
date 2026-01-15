/**
 * Routely Transition Plugin - Page transition animations.
 * @packageDocumentation
 */

import type { RouterPlugin } from '@oxog/routely-core';
import type { Router, Route } from '@oxog/routely-core';
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  createElement,
  ReactNode,
} from 'react';

/**
 * Available transition types.
 */
export type TransitionType = 'fade' | 'slide' | 'custom';

/**
 * Transition state during page change.
 */
export type TransitionState = 'idle' | 'entering' | 'leaving';

/**
 * CSS class names for transition states.
 */
export interface TransitionClasses {
  /** Applied when entering */
  enter?: string;
  /** Applied when entering active */
  enterActive?: string;
  /** Applied when leaving */
  leave?: string;
  /** Applied when leaving active */
  leaveActive?: string;
}

/**
 * Options for configuring the transition plugin.
 *
 * @example
 * ```typescript
 * router.use(transitionPlugin({
 *   type: 'fade',
 *   duration: 300,
 * }));
 * ```
 */
export interface TransitionPluginOptions {
  /**
   * Type of transition animation.
   * @default 'fade'
   */
  type?: TransitionType;

  /**
   * Duration of transition in milliseconds.
   * @default 300
   */
  duration?: number;

  /**
   * Custom CSS classes for transition states.
   * If provided, these override the default classes.
   */
  classes?: TransitionClasses;

  /**
   * Easing function for the transition.
   * @default 'ease-in-out'
   */
  easing?: string;

  /**
   * Whether to use CSS transitions.
   * @default true
   */
  useCss?: boolean;
}

/**
 * Context value for transition state.
 */
interface TransitionContextValue {
  state: TransitionState;
  fromRoute: Route | null;
  toRoute: Route | null;
}

/**
 * React context for transition state.
 */
const TransitionContext = createContext<TransitionContextValue | null>(null);

/**
 * Get transition plugin options from router.
 */
export function getTransitionPluginOptions(router: Router): TransitionPluginOptions | undefined {
  return (router as any)[Symbol.for('transition-plugin-options')];
}

/**
 * Get default CSS classes for a transition type.
 */
function getDefaultClasses(type: TransitionType): TransitionClasses {
  if (type === 'fade') {
    return {
      enter: 'transition-enter',
      enterActive: 'transition-enter-active',
      leave: 'transition-leave',
      leaveActive: 'transition-leave-active',
    };
  }

  if (type === 'slide') {
    return {
      enter: 'transition-slide-enter',
      enterActive: 'transition-slide-enter-active',
      leave: 'transition-slide-leave',
      leaveActive: 'transition-slide-leave-active',
    };
  }

  return {};
}

/**
 * Create the transition plugin instance.
 *
 * This plugin provides page transition animations with:
 * - Built-in fade and slide transitions
 * - Custom CSS class support
 * - Transition state tracking (idle/entering/leaving)
 * - Configurable duration and easing
 *
 * @param options - Plugin configuration options
 * @returns A router plugin for page transitions
 *
 * @example
 * ```typescript
 * import { transitionPlugin, useTransition } from '@oxog/routely-plugin-transition';
 *
 * // Register the plugin
 * router.use(transitionPlugin({
 *   type: 'fade',
 *   duration: 300,
 * }));
 *
 * // In your component
 * function App() {
 *   const { state, fromRoute, toRoute } = useTransition();
 *   const classes = getTransitionClasses();
 *   
 *   return createElement('div', {
 *     className: `${classes.enter} ${classes.enterActive}`
 *   }, children);
 * }
 * ```
 */
export function transitionPlugin(options: TransitionPluginOptions = {}): RouterPlugin {
  const type = options.type ?? 'fade';
  const duration = options.duration ?? 300;
  const easing = options.easing ?? 'ease-in-out';
  const classes = options.classes ?? getDefaultClasses(type);
  const useCss = options.useCss ?? true;

  return {
    name: 'transition',
    version: '1.0.0',

    install(router: Router) {
      // Store options on the router
      (router as any)[Symbol.for('transition-plugin-options')] = {
        type,
        duration,
        easing,
        classes,
        useCss,
      };

      // Store TransitionProvider on router for React integration
      (router as any)[Symbol.for('transition-provider')] = TransitionProvider;
    },
  };
}

/**
 * Hook to access transition state.
 *
 * @returns Transition state and route information
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { state, fromRoute, toRoute } = useTransition();
 *   
 *   if (state === 'entering') {
 *     return createElement('div', { className: 'page-enter' }, 'Entering...');
 *   }
 *   
 *   return createElement('div', {}, children);
 * }
 * ```
 */
export function useTransition(): TransitionContextValue {
  const context = useContext(TransitionContext);
  if (!context) {
    // Return default context if not in a transition
    return {
      state: 'idle',
      fromRoute: null,
      toRoute: null,
    };
  }
  return context;
}

/**
 * Get CSS classes for transition states.
 *
 * @param router - Router instance
 * @returns CSS class names for each transition state
 *
 * @example
 * ```typescript
 * const classes = getTransitionClasses(router);
 * // { enter: 'transition-enter', enterActive: 'transition-enter-active', ... }
 * ```
 */
export function getTransitionClasses(router: Router): TransitionClasses {
  const options = getTransitionPluginOptions(router);
  if (!options) {
    return {};
  }
  return options.classes ?? {};
}

/**
 * Provider component for transition state.
 *
 * @internal
 */
export function TransitionProvider({
  children,
  onStateChange,
}: {
  children: ReactNode;
  onStateChange?: (state: TransitionState, fromRoute: Route | null, toRoute: Route | null) => void;
}) {
  const [state, setState] = useState<TransitionState>('idle');
  const [fromRoute, setFromRoute] = useState<Route | null>(null);
  const [toRoute, setToRoute] = useState<Route | null>(null);

  // Call onStateChange on mount with initial state
  useEffect(() => {
    onStateChange?.('idle', null, null);
  }, [onStateChange]);

  const startTransition = useCallback(
    (from: Route | null, to: Route | null) => {
      setFromRoute(from);
      setToRoute(to);
      setState('entering');
      onStateChange?.('entering', from, to);

      // Reset to idle after a short delay
      setTimeout(() => {
        setState('idle');
        onStateChange?.('idle', from, to);
      }, 300);
    },
    [onStateChange]
  );

  const endTransition = useCallback(() => {
    setState('leaving');
    onStateChange?.('leaving', fromRoute, toRoute);

    setTimeout(() => {
      setState('idle');
      setFromRoute(null);
      setToRoute(null);
      onStateChange?.('idle', null, null);
    }, 300);
  }, [fromRoute, toRoute, onStateChange]);

  return createElement(
    TransitionContext.Provider,
    {
      value: { state, fromRoute, toRoute },
      children: createElement(
        TransitionActionsContext.Provider,
        {
          value: { startTransition, endTransition },
        },
        children
      ),
    }
  );
}

/**
 * Context for transition actions.
 */
const TransitionActionsContext = createContext<{
  startTransition: (from: Route | null, to: Route | null) => void;
  endTransition: () => void;
} | null>(null);

/**
 * Default CSS for fade transitions.
 *
 * @example
 * ```typescript
 * // Add to your global CSS
 * import { defaultFadeCss } from '@oxog/routely-plugin-transition';
 * console.log(defaultFadeCss);
 * ```
 */
export const defaultFadeCss = `
.transition-enter {
  opacity: 0;
}

.transition-enter-active {
  opacity: 1;
  transition: opacity 300ms ease-in-out;
}

.transition-leave {
  opacity: 1;
}

.transition-leave-active {
  opacity: 0;
  transition: opacity 300ms ease-in-out;
}
`;

/**
 * Default CSS for slide transitions.
 *
 * @example
 * ```typescript
 * // Add to your global CSS
 * import { defaultSlideCss } from '@oxog/routely-plugin-transition';
 * console.log(defaultSlideCss);
 * ```
 */
export const defaultSlideCss = `
.transition-slide-enter {
  transform: translateX(100%);
  opacity: 0;
}

.transition-slide-enter-active {
  transform: translateX(0);
  opacity: 1;
  transition: transform 300ms ease-in-out, opacity 300ms ease-in-out;
}

.transition-slide-leave {
  transform: translateX(0);
  opacity: 1;
}

.transition-slide-leave-active {
  transform: translateX(-100%);
  opacity: 0;
  transition: transform 300ms ease-in-out, opacity 300ms ease-in-out;
}
`;
