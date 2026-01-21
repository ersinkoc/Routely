import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useRouterContext, RouterContext } from '../src/context';

describe('useRouterContext', () => {
  it('should return context when used within RouterProvider', () => {
    const mockRouter = {
      currentRoute: null,
      routes: [],
      navigate: () => Promise.resolve(),
      back: () => {},
      forward: () => {},
      go: () => {},
      use: () => ({} as any),
      unregister: () => {},
      list: () => [],
      on: () => (() => {}),
      off: () => {},
    };

    function TestComponent() {
      const context = useRouterContext();
      return <div data-testid="context">{context?.router ? 'has-router' : 'no-router'}</div>;
    }

    render(
      <RouterContext.Provider value={{ router: mockRouter, currentRoute: null }}>
        <TestComponent />
      </RouterContext.Provider>
    );

    expect(screen.getByTestId('context').textContent).toBe('has-router');
  });

  it('should throw error when used outside RouterProvider', () => {
    function TestComponent() {
      const context = useRouterContext();
      return <div>{context?.router ? 'has-router' : 'no-router'}</div>;
    }

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useRouterContext must be used within RouterProvider');
  });

  it('should provide currentRoute from context', () => {
    const mockRouter = {
      currentRoute: null,
      routes: [],
      navigate: () => Promise.resolve(),
      back: () => {},
      forward: () => {},
      go: () => {},
      use: () => ({} as any),
      unregister: () => {},
      list: () => [],
      on: () => (() => {}),
      off: () => {},
    };

    const mockRoute = { path: '/users', params: { id: '123' } };

    function TestComponent() {
      const context = useRouterContext();
      return <div data-testid="route">{context?.currentRoute?.path || 'none'}</div>;
    }

    render(
      <RouterContext.Provider value={{ router: mockRouter, currentRoute: mockRoute }}>
        <TestComponent />
      </RouterContext.Provider>
    );

    expect(screen.getByTestId('route').textContent).toBe('/users');
  });
});
