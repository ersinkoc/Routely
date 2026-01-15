import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { createRouter, route, createMemoryHistory } from '@oxog/routely-core';
import { RouterProvider } from '../src/provider';
import { useRoute } from '../src/hooks';

describe('RouterProvider', () => {
  it('should render children', () => {
    const Home = () => <div>Home</div>;
    const history = createMemoryHistory();
    const router = createRouter({ routes: [route('/', Home)], history });

    render(
      <RouterProvider router={router}>
        <div>Test Content</div>
      </RouterProvider>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should provide router context', () => {
    const TestComponent = () => {
      const currentRoute = useRoute();
      return <div>Path: {currentRoute.path}</div>;
    };

    const Home = () => <div>Home</div>;
    const history = createMemoryHistory();
    const router = createRouter({ routes: [route('/', Home)], history });

    render(
      <RouterProvider router={router}>
        <TestComponent />
      </RouterProvider>
    );

    expect(screen.getByText(/Path:/)).toBeInTheDocument();
  });

  it('should update on route change', async () => {
    const TestComponent = () => {
      const currentRoute = useRoute();
      return <div>Path: {currentRoute.path}</div>;
    };

    const Home = () => <div>Home</div>;
    const Users = () => <div>Users</div>;
    const history = createMemoryHistory();
    const router = createRouter({
      routes: [route('/', Home), route('/users', Users)],
      history,
    });

    render(
      <RouterProvider router={router}>
        <TestComponent />
      </RouterProvider>
    );

    // Navigate to /users
    router.navigate('/users');

    await waitFor(() => {
      expect(screen.getByText('Path: /users')).toBeInTheDocument();
    });
  });
});
