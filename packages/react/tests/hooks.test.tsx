import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createRouter, route, createMemoryHistory } from '@oxog/routely-core';
import { RouterProvider } from '../src/provider';
import { useNavigate, useParams, useRoute, useSearch } from '../src/hooks';

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

  it('should navigate with RouteRef object', async () => {
    const TestComponent = () => {
      const navigate = useNavigate();
      const currentRoute = useRoute();

      return (
        <div>
          <div>Path: {currentRoute.path}</div>
          <button onClick={() => navigate({ path: '/users', state: { from: 'home' } })}>
            Go to Users
          </button>
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

  it('should navigate with string and options', async () => {
    const TestComponent = () => {
      const navigate = useNavigate();
      const currentRoute = useRoute();

      return (
        <div>
          <div>Path: {currentRoute.path}</div>
          <button onClick={() => navigate('/users', { replace: true })}>Go to Users</button>
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

  it('should handle navigation errors gracefully', () => {
    const TestComponent = () => {
      const navigate = useNavigate();
      return (
        <button
          onClick={() => {
            // Navigate to a path that exceeds max length
            const longPath = '/x'.repeat(3000);
            navigate(longPath);
          }}
        >
          Navigate to Long Path
        </button>
      );
    };

    const Home = () => <div>Home</div>;
    const history = createMemoryHistory();
    const router = createRouter({
      routes: [route('/', Home)],
      history,
    });

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <RouterProvider router={router}>
        <TestComponent />
      </RouterProvider>
    );

    fireEvent.click(screen.getByText('Navigate to Long Path'));

    // Console.error should be called with navigation error
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
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

  it('should throw error when no route is matched', () => {
    const TestComponent = () => {
      const params = useParams<{ id: string }>();
      return <div>User ID: {params.id}</div>;
    };

    const history = createMemoryHistory({ initialEntries: ['/nonexistent'] });
    const router = createRouter({
      routes: [],
      history,
    });

    // RouterProvider will render but with null currentRoute
    // We need to catch the error from useParams
    expect(() => {
      render(
        <RouterProvider router={router}>
          <TestComponent />
        </RouterProvider>
      );
    }).toThrow('useParams called but no route is currently matched');
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

  it('should throw error when no route is matched', () => {
    const TestComponent = () => {
      const route = useRoute();
      return <div>Path: {route.path}</div>;
    };

    const history = createMemoryHistory({ initialEntries: ['/nonexistent'] });
    const router = createRouter({
      routes: [],
      history,
    });

    // RouterProvider will render but with null currentRoute
    // We need to catch the error from useRoute
    expect(() => {
      render(
        <RouterProvider router={router}>
          <TestComponent />
        </RouterProvider>
      );
    }).toThrow('useRoute called but no route is currently matched');
  });
});

describe('useSearch', () => {
  it('should return current search params', () => {
    const TestComponent = () => {
      const [search] = useSearch<Record<string, string>>();
      return <div>Page: {search.page || 'none'}</div>;
    };

    const Home = () => <div>Home</div>;
    const history = createMemoryHistory({ initialEntries: ['/users?page=1'] });
    const router = createRouter({
      routes: [route('/users', Home)],
      history,
    });

    render(
      <RouterProvider router={router}>
        <TestComponent />
      </RouterProvider>
    );

    expect(screen.getByText('Page: 1')).toBeInTheDocument();
  });

  it('should update search params', async () => {
    const TestComponent = () => {
      const [search, setSearch] = useSearch<Record<string, string>>();
      return (
        <div>
          <div>Page: {search.page || 'none'}</div>
          <button onClick={() => setSearch({ page: '2' })}>Set Page 2</button>
        </div>
      );
    };

    const Home = () => <div>Home</div>;
    const history = createMemoryHistory({ initialEntries: ['/users?page=1'] });
    const router = createRouter({
      routes: [route('/users', Home)],
      history,
    });

    render(
      <RouterProvider router={router}>
        <TestComponent />
      </RouterProvider>
    );

    expect(screen.getByText('Page: 1')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Set Page 2'));

    await waitFor(() => {
      expect(screen.getByText('Page: 2')).toBeInTheDocument();
    });
  });

  it('should update search params with function', async () => {
    const TestComponent = () => {
      const [search, setSearch] = useSearch<Record<string, string>>();
      return (
        <div>
          <div>Page: {search.page || 'none'}</div>
          <button onClick={() => setSearch((prev) => ({ ...prev, page: '3' }))}>
            Set Page 3
          </button>
        </div>
      );
    };

    const Home = () => <div>Home</div>;
    const history = createMemoryHistory({ initialEntries: ['/users?page=1'] });
    const router = createRouter({
      routes: [route('/users', Home)],
      history,
    });

    render(
      <RouterProvider router={router}>
        <TestComponent />
      </RouterProvider>
    );

    expect(screen.getByText('Page: 1')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Set Page 3'));

    await waitFor(() => {
      expect(screen.getByText('Page: 3')).toBeInTheDocument();
    });
  });

  it('should throw error when update value is null', () => {
    const TestComponent = () => {
      const [, setSearch] = useSearch<Record<string, string>>();
      // Call setSearch with null immediately in the component
      try {
        setSearch(null as any);
      } catch (e) {
        return <div>Caught error</div>;
      }
      return <div>No error</div>;
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

    // Should have caught the error
    expect(screen.getByText('Caught error')).toBeInTheDocument();
  });

  it('should throw error when update value is undefined', () => {
    const TestComponent = () => {
      const [, setSearch] = useSearch<Record<string, string>>();
      // Call setSearch with undefined immediately in the component
      try {
        setSearch(undefined as any);
      } catch (e) {
        return <div>Caught error</div>;
      }
      return <div>No error</div>;
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

    // Should have caught the error
    expect(screen.getByText('Caught error')).toBeInTheDocument();
  });

  it('should handle function that throws error gracefully', () => {
    const TestComponent = () => {
      const [search, setSearch] = useSearch<Record<string, string>>();
      return (
        <div>
          <div>Page: {search.page || 'none'}</div>
          <button
            onClick={() =>
              setSearch(() => {
                throw new Error('Function error');
              })
            }
          >
            Trigger Error
          </button>
        </div>
      );
    };

    const Home = () => <div>Home</div>;
    const history = createMemoryHistory({ initialEntries: ['/users?page=1'] });
    const router = createRouter({
      routes: [route('/users', Home)],
      history,
    });

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <RouterProvider router={router}>
        <TestComponent />
      </RouterProvider>
    );

    expect(screen.getByText('Page: 1')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Trigger Error'));

    // Console.error should be called
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
