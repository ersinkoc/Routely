/**
 * Tests for transition plugin
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import {
  transitionPlugin,
  getTransitionPluginOptions,
  useTransition,
  TransitionProvider,
  getTransitionClasses,
  defaultFadeCss,
  defaultSlideCss,
  type TransitionPluginOptions,
} from '../src/index';
import type { Router } from '@oxog/routely-core';

// Mock router
const createMockRouter = (): Router => ({
  currentRoute: null,
  routes: [],
  history: {} as any,
  navigate: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  go: vi.fn(),
  use: vi.fn(function (this: Router, plugin: any) {
    plugin.install(this);
    return this;
  }),
  unregister: vi.fn(),
  list: vi.fn(() => []),
  on: vi.fn(() => vi.fn()),
  off: vi.fn(),
});

describe('transitionPlugin', () => {
  beforeEach(() => {
    cleanup();
  });

  describe('plugin creation', () => {
    it('should create a plugin with correct metadata', () => {
      const plugin = transitionPlugin();
      expect(plugin.name).toBe('transition');
      expect(plugin.version).toBe('1.0.0');
      expect(typeof plugin.install).toBe('function');
    });

    it('should accept empty options', () => {
      const plugin = transitionPlugin({});
      expect(plugin).toBeDefined();
    });

    it('should accept type option', () => {
      const plugin = transitionPlugin({ type: 'slide' });
      expect(plugin).toBeDefined();
    });

    it('should accept duration option', () => {
      const plugin = transitionPlugin({ duration: 500 });
      expect(plugin).toBeDefined();
    });

    it('should accept classes option', () => {
      const plugin = transitionPlugin({
        classes: {
          enter: 'custom-enter',
          enterActive: 'custom-enter-active',
        },
      });
      expect(plugin).toBeDefined();
    });

    it('should accept easing option', () => {
      const plugin = transitionPlugin({ easing: 'ease-out' });
      expect(plugin).toBeDefined();
    });

    it('should accept useCss option', () => {
      const plugin = transitionPlugin({ useCss: false });
      expect(plugin).toBeDefined();
    });

    it('should accept all options', () => {
      const plugin = transitionPlugin({
        type: 'slide',
        duration: 500,
        easing: 'ease-out',
        classes: {
          enter: 'custom-enter',
          enterActive: 'custom-enter-active',
          leave: 'custom-leave',
          leaveActive: 'custom-leave-active',
        },
        useCss: false,
      });
      expect(plugin).toBeDefined();
    });
  });

  describe('plugin installation', () => {
    it('should store options on router during install', () => {
      const router = createMockRouter();
      const options: TransitionPluginOptions = {
        type: 'slide',
        duration: 500,
        easing: 'ease-out',
      };
      const plugin = transitionPlugin(options);

      plugin.install(router);

      const storedOptions = getTransitionPluginOptions(router);
      expect(storedOptions).toBeDefined();
      expect(storedOptions?.type).toBe('slide');
      expect(storedOptions?.duration).toBe(500);
      expect(storedOptions?.easing).toBe('ease-out');
    });

    it('should store default options when none provided', () => {
      const router = createMockRouter();
      const plugin = transitionPlugin();

      plugin.install(router);

      const options = getTransitionPluginOptions(router);
      expect(options).toBeDefined();
      expect(options?.type).toBe('fade');
      expect(options?.duration).toBe(300);
      expect(options?.easing).toBe('ease-in-out');
      expect(options?.useCss).toBe(true);
    });

    it('should store default classes for fade transition', () => {
      const router = createMockRouter();
      const plugin = transitionPlugin({ type: 'fade' });

      plugin.install(router);

      const options = getTransitionPluginOptions(router);
      expect(options?.classes).toEqual({
        enter: 'transition-enter',
        enterActive: 'transition-enter-active',
        leave: 'transition-leave',
        leaveActive: 'transition-leave-active',
      });
    });

    it('should store default classes for slide transition', () => {
      const router = createMockRouter();
      const plugin = transitionPlugin({ type: 'slide' });

      plugin.install(router);

      const options = getTransitionPluginOptions(router);
      expect(options?.classes).toEqual({
        enter: 'transition-slide-enter',
        enterActive: 'transition-slide-enter-active',
        leave: 'transition-slide-leave',
        leaveActive: 'transition-slide-leave-active',
      });
    });

    it('should store custom classes when provided', () => {
      const router = createMockRouter();
      const customClasses = {
        enter: 'my-enter',
        enterActive: 'my-enter-active',
        leave: 'my-leave',
        leaveActive: 'my-leave-active',
      };
      const plugin = transitionPlugin({ classes: customClasses });

      plugin.install(router);

      const options = getTransitionPluginOptions(router);
      expect(options?.classes).toEqual(customClasses);
    });

    it('should store TransitionProvider on router', () => {
      const router = createMockRouter();
      const plugin = transitionPlugin();

      plugin.install(router);

      expect((router as any)[Symbol.for('transition-provider')]).toBe(TransitionProvider);
    });
  });

  describe('useTransition', () => {
    it('should return default context when not in provider', () => {
      const { result } = render(
        React.createElement(() => {
          const transition = useTransition();
          return React.createElement('span', { 'data-testid': 'state' }, transition.state);
        })
      );

      expect(screen.getByTestId('state').textContent).toBe('idle');
    });

    it('should provide transition state from context', () => {
      const onStateChange = vi.fn();

      render(
        React.createElement(
          TransitionProvider,
          { onStateChange },
          React.createElement(() => {
            const transition = useTransition();
            return React.createElement('span', { 'data-testid': 'state' }, transition.state);
          })
        )
      );

      expect(screen.getByTestId('state').textContent).toBe('idle');
    });

    it('should provide fromRoute and toRoute', () => {
      render(
        React.createElement(
          TransitionProvider,
          {},
          React.createElement(() => {
            const { fromRoute, toRoute } = useTransition();
            return React.createElement('span', {
              'data-testid': 'routes'
            }, `${fromRoute?.path || 'null'},${toRoute?.path || 'null'}`);
          })
        )
      );

      expect(screen.getByTestId('routes').textContent).toBe('null,null');
    });
  });

  describe('TransitionProvider', () => {
    it('should render children', () => {
      render(
        React.createElement(
          TransitionProvider,
          {},
          React.createElement('div', { 'data-testid': 'child' }, 'Child')
        )
      );

      expect(screen.getByTestId('child')).toBeDefined();
    });

    it('should start with idle state', () => {
      render(
        React.createElement(
          TransitionProvider,
          {},
          React.createElement(() => {
            const { state } = useTransition();
            return React.createElement('span', { 'data-testid': 'state' }, state);
          })
        )
      );

      expect(screen.getByTestId('state').textContent).toBe('idle');
    });

    it('should call onStateChange callback', () => {
      const onStateChange = vi.fn();

      render(
        React.createElement(
          TransitionProvider,
          { onStateChange },
          React.createElement('div', {})
        )
      );

      // Initial state should trigger callback with idle
      expect(onStateChange).toHaveBeenCalledWith('idle', null, null);
    });
  });

  describe('getTransitionClasses', () => {
    it('should return empty object when plugin not installed', () => {
      const router = createMockRouter();
      const classes = getTransitionClasses(router);

      expect(classes).toEqual({});
    });

    it('should return classes for fade transition', () => {
      const router = createMockRouter();
      const plugin = transitionPlugin({ type: 'fade' });

      plugin.install(router);

      const classes = getTransitionClasses(router);
      expect(classes).toEqual({
        enter: 'transition-enter',
        enterActive: 'transition-enter-active',
        leave: 'transition-leave',
        leaveActive: 'transition-leave-active',
      });
    });

    it('should return classes for slide transition', () => {
      const router = createMockRouter();
      const plugin = transitionPlugin({ type: 'slide' });

      plugin.install(router);

      const classes = getTransitionClasses(router);
      expect(classes).toEqual({
        enter: 'transition-slide-enter',
        enterActive: 'transition-slide-enter-active',
        leave: 'transition-slide-leave',
        leaveActive: 'transition-slide-leave-active',
      });
    });

    it('should return custom classes when provided', () => {
      const router = createMockRouter();
      const customClasses = {
        enter: 'my-enter',
        enterActive: 'my-enter-active',
        leave: 'my-leave',
        leaveActive: 'my-leave-active',
      };
      const plugin = transitionPlugin({ classes: customClasses });

      plugin.install(router);

      const classes = getTransitionClasses(router);
      expect(classes).toEqual(customClasses);
    });
  });

  describe('default CSS', () => {
    it('should export defaultFadeCss', () => {
      expect(defaultFadeCss).toContain('.transition-enter');
      expect(defaultFadeCss).toContain('opacity: 0');
      expect(defaultFadeCss).toContain('.transition-enter-active');
      expect(defaultFadeCss).toContain('opacity: 1');
      expect(defaultFadeCss).toContain('transition: opacity 300ms ease-in-out');
    });

    it('should export defaultSlideCss', () => {
      expect(defaultSlideCss).toContain('.transition-slide-enter');
      expect(defaultSlideCss).toContain('transform: translateX(100%)');
      expect(defaultSlideCss).toContain('opacity: 0');
      expect(defaultSlideCss).toContain('.transition-slide-enter-active');
      expect(defaultSlideCss).toContain('transform: translateX(0)');
      expect(defaultSlideCss).toContain('transition: transform 300ms ease-in-out');
    });
  });

  describe('integration', () => {
    it('should work with router.use()', () => {
      const router = createMockRouter();
      const plugin = transitionPlugin();

      const result = router.use(plugin);

      expect(result).toBe(router);
    });

    it('should handle plugin with fade options', () => {
      const router = createMockRouter();
      const plugin = transitionPlugin({
        type: 'fade',
        duration: 200,
        easing: 'ease-out',
      });

      plugin.install(router);

      const options = getTransitionPluginOptions(router);
      expect(options?.type).toBe('fade');
      expect(options?.duration).toBe(200);
      expect(options?.easing).toBe('ease-out');
    });

    it('should handle plugin with slide options', () => {
      const router = createMockRouter();
      const plugin = transitionPlugin({
        type: 'slide',
        duration: 500,
        easing: 'ease-in-out',
      });

      plugin.install(router);

      const options = getTransitionPluginOptions(router);
      expect(options?.type).toBe('slide');
      expect(options?.duration).toBe(500);
      expect(options?.easing).toBe('ease-in-out');
    });

    it('should handle plugin with custom classes', () => {
      const router = createMockRouter();
      const customClasses = {
        enter: 'page-enter',
        enterActive: 'page-enter-active',
        leave: 'page-leave',
        leaveActive: 'page-leave-active',
      };
      const plugin = transitionPlugin({
        type: 'custom',
        classes: customClasses,
      });

      plugin.install(router);

      const options = getTransitionPluginOptions(router);
      expect(options?.classes).toEqual(customClasses);
    });
  });
});
