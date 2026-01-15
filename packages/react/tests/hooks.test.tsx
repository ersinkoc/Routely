import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createRouter, route, createMemoryHistory } from '@oxog/routely-core';
import { RouterProvider } from '../src/provider';
import { useNavigate, useParams, useRoute } from '../src/hooks';

describe('useNavigate', () => {
  it('should navigate to new route', async () => {
    const TestComponent = () => {
      const navigate = useNavigate();
      const currentRoute = useRoute();

      return (
        <div>
          <div>Path: {currentRoute.path}</div>
          <button onClick={() => navigate('/users')}>Go to Users</button>
        </div>
      );
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

    fireEvent.click(screen.getByText('Go to Users'));

    await waitFor(() => {
      expect(screen.getByText('Path: /users')).toBeInTheDocument();
    });
  });

  it('should navigate with delta', async () => {
    const TestComponent = () => {
      const navigate = useNavigate();
      const currentRoute = useRoute();

      return (
        <div>
          <div>Path: {currentRoute.path}</div>
          <button onClick={() => navigate(-1)}>Go Back</button>
        </div>
      );
    };

    const Home = () => <div>Home</div>;
    const Users = () => <div>Users</div>;
    const history = createMemoryHistory({ initialEntries: ['/', '/users'], initialIndex: 1 });
    const router = createRouter({
      routes: [route('/', Home), route('/users', Users)],
      history,
    });

    render(
      <RouterProvider router={router}>
        <TestComponent />
      </RouterProvider>
    );

    fireEvent.click(screen.getByText('Go Back'));

    await waitFor(() => {
      expect(screen.getByText('Path: /')).toBeInTheDocument();
    });
  });
});

describe('useParams', () => {
  it('should return route params', () => {
    const TestComponent = () => {
      const params = useParams<{ id: string }>();
      return <div>User ID: {params.id}</div>;
    };

    const UserDetail = () => <div>User</div>;
    const history = createMemoryHistory({ initialEntries: ['/users/123'] });
    const router = createRouter({
      routes: [route('/users/:id', UserDetail)],
      history,
    });

    render(
      <RouterProvider router={router}>
        <TestComponent />
      </RouterProvider>
    );

    expect(screen.getByText('User ID: 123')).toBeInTheDocument();
  });
});

describe('useRoute', () => {
  it('should return current route', () => {
    const TestComponent = () => {
      const route = useRoute();
      return <div>Path: {route.path}</div>;
    };

    const Home = () => <div>Home</div>;
    const history = createMemoryHistory();
    const router = createRouter({
      routes: [route('/', Home)],
      history,
    });

    render(
      <RouterProvider router={router}>
        <TestComponent />
      </RouterProvider>
    );

    expect(screen.getByText('Path: /')).toBeInTheDocument();
  });
});
