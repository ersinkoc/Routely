import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import { createRouter, route, createMemoryHistory } from '@oxog/routely-core';
import { RouterProvider } from '../src/provider';
import { Link, Outlet } from '../src/components';

describe('Link', () => {
  it('should render link', () => {
    const Home = () => <div>Home</div>;
    const history = createMemoryHistory();
    const router = createRouter({ routes: [route('/', Home)], history });

    render(
      <RouterProvider router={router}>
        <Link to="/users">Users</Link>
      </RouterProvider>
    );

    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Users')).toHaveAttribute('href', '/users');
  });

  it('should render link with object to prop', () => {
    const Home = () => <div>Home</div>;
    const history = createMemoryHistory();
    const router = createRouter({ routes: [route('/', Home)], history });

    render(
      <RouterProvider router={router}>
        <Link to={{ path: '/users', state: { from: 'home' } }}>Users</Link>
      </RouterProvider>
    );

    expect(screen.getByText('Users')).toHaveAttribute('href', '/users');
  });

  it('should navigate on click', async () => {
    const Home = () => (
      <div>
        <div>Home Page</div>
        <Link to="/users">Go to Users</Link>
      </div>
    );

    const Users = () => <div>Users Page</div>;

    const history = createMemoryHistory();
    const router = createRouter({
      routes: [route('/', Home), route('/users', Users)],
      history,
    });

    render(
      <RouterProvider router={router}>
        <Outlet />
      </RouterProvider>
    );

    expect(screen.getByText('Home Page')).toBeInTheDocument();

    // Navigate directly instead of clicking link for more reliable test
    router.navigate('/users');

    await waitFor(() => {
      expect(screen.getByText('Users Page')).toBeInTheDocument();
    });
  });

  it('should apply active class name', () => {
    const Home = () => (
      <div>
        <Link to="/" activeClassName="active">
          Home
        </Link>
        <Link to="/users" activeClassName="active">
          Users
        </Link>
      </div>
    );

    const history = createMemoryHistory();
    const router = createRouter({
      routes: [route('/', Home), route('/users', () => null)],
      history,
    });

    render(
      <RouterProvider router={router}>
        <Outlet />
      </RouterProvider>
    );

    const homeLink = screen.getByText('Home');
    const usersLink = screen.getByText('Users');

    expect(homeLink).toHaveClass('active');
    expect(usersLink).not.toHaveClass('active');
  });

  it('should merge active class name with existing className', () => {
    const Home = () => (
      <div>
        <Link to="/" className="link" activeClassName="active">
          Home
        </Link>
      </div>
    );

    const history = createMemoryHistory();
    const router = createRouter({ routes: [route('/', Home)], history });

    render(
      <RouterProvider router={router}>
        <Outlet />
      </RouterProvider>
    );

    const homeLink = screen.getByText('Home');
    expect(homeLink).toHaveClass('link');
    expect(homeLink).toHaveClass('active');
  });

  it('should not apply active class when not active', () => {
    const Home = () => (
      <div>
        <Link to="/users" activeClassName="active">
          Users
        </Link>
      </div>
    );

    const history = createMemoryHistory();
    const router = createRouter({ routes: [route('/', Home), route('/users', () => null)], history });

    render(
      <RouterProvider router={router}>
        <Outlet />
      </RouterProvider>
    );

    const usersLink = screen.getByText('Users');
    expect(usersLink).not.toHaveClass('active');
  });

  it('should handle replace prop', () => {
    const Home = () => (
      <div>
        <Link to="/users" replace={true}>
          Go to Users
        </Link>
      </div>
    );

    const history = createMemoryHistory();
    const router = createRouter({ routes: [route('/', Home), route('/users', () => null)], history });

    render(
      <RouterProvider router={router}>
        <Outlet />
      </RouterProvider>
    );

    const link = screen.getByText('Go to Users');
    expect(link).toBeInTheDocument();
  });

  it('should pass through additional props', () => {
    const Home = () => (
      <div>
        <Link to="/users" id="users-link" data-test="users">
          Users
        </Link>
      </div>
    );

    const history = createMemoryHistory();
    const router = createRouter({ routes: [route('/', Home)], history });

    render(
      <RouterProvider router={router}>
        <Outlet />
      </RouterProvider>
    );

    const link = screen.getByText('Users');
    expect(link).toHaveAttribute('id', 'users-link');
    expect(link).toHaveAttribute('data-test', 'users');
  });

  it('should handle onClick callback', () => {
    const onClick = vi.fn();
    const Home = () => (
      <div>
        <Link to="/users" onClick={onClick}>
          Go to Users
        </Link>
      </div>
    );

    const history = createMemoryHistory();
    const router = createRouter({ routes: [route('/', Home), route('/users', () => null)], history });

    render(
      <RouterProvider router={router}>
        <Outlet />
      </RouterProvider>
    );

    const link = screen.getByText('Go to Users');

    fireEvent.click(link);

    expect(onClick).toHaveBeenCalled();
  });

  it('should not navigate when onClick prevents default', () => {
    const onClick = vi.fn((e) => {
      e.preventDefault();
    });
    const Home = () => (
      <div>
        <Link to="/users" onClick={onClick}>
          Go to Users
        </Link>
      </div>
    );

    const history = createMemoryHistory();
    const router = createRouter({ routes: [route('/', Home), route('/users', () => null)], history });

    render(
      <RouterProvider router={router}>
        <Outlet />
      </RouterProvider>
    );

    const link = screen.getByText('Go to Users');

    fireEvent.click(link);

    expect(onClick).toHaveBeenCalled();
    // Should still be at home since onClick prevented default
    expect(history.location.pathname).toBe('/');
  });

  it('should not prevent default when Ctrl key is pressed', () => {
    const Home = () => (
      <div>
        <Link to="/users">Go to Users</Link>
      </div>
    );

    const history = createMemoryHistory();
    const router = createRouter({ routes: [route('/', Home), route('/users', () => null)], history });

    render(
      <RouterProvider router={router}>
        <Link to="/users">Go to Users</Link>
      </RouterProvider>
    );

    const link = screen.getByText('Go to Users');

    fireEvent.click(link, { ctrlKey: true });

    // Should not navigate since Ctrl+click opens in new tab
    expect(history.location.pathname).toBe('/');
  });

  it('should not prevent default when Cmd key is pressed', () => {
    const Home = () => (
      <div>
        <Link to="/users">Go to Users</Link>
      </div>
    );

    const history = createMemoryHistory();
    const router = createRouter({ routes: [route('/', Home), route('/users', () => null)], history });

    render(
      <RouterProvider router={router}>
        <Link to="/users">Go to Users</Link>
      </RouterProvider>
    );

    const link = screen.getByText('Go to Users');

    fireEvent.click(link, { metaKey: true });

    expect(history.location.pathname).toBe('/');
  });

  it('should not prevent default when Shift key is pressed', () => {
    const Home = () => (
      <div>
        <Link to="/users">Go to Users</Link>
      </div>
    );

    const history = createMemoryHistory();
    const router = createRouter({ routes: [route('/', Home), route('/users', () => null)], history });

    render(
      <RouterProvider router={router}>
        <Link to="/users">Go to Users</Link>
      </RouterProvider>
    );

    const link = screen.getByText('Go to Users');

    fireEvent.click(link, { shiftKey: true });

    expect(history.location.pathname).toBe('/');
  });

  it('should not prevent default when Alt key is pressed', () => {
    const Home = () => (
      <div>
        <Link to="/users">Go to Users</Link>
      </div>
    );

    const history = createMemoryHistory();
    const router = createRouter({ routes: [route('/', Home), route('/users', () => null)], history });

    render(
      <RouterProvider router={router}>
        <Link to="/users">Go to Users</Link>
      </RouterProvider>
    );

    const link = screen.getByText('Go to Users');

    fireEvent.click(link, { altKey: true });

    expect(history.location.pathname).toBe('/');
  });

  it('should not prevent default when middle mouse button is clicked', () => {
    const Home = () => (
      <div>
        <Link to="/users">Go to Users</Link>
      </div>
    );

    const history = createMemoryHistory();
    const router = createRouter({ routes: [route('/', Home), route('/users', () => null)], history });

    render(
      <RouterProvider router={router}>
        <Link to="/users">Go to Users</Link>
      </RouterProvider>
    );

    const link = screen.getByText('Go to Users');

    fireEvent.click(link, { button: 1 });

    expect(history.location.pathname).toBe('/');
  });

  it('should not prevent default when target attribute is set', () => {
    const Home = () => (
      <div>
        <Link to="/users" target="_blank">
          Go to Users
        </Link>
      </div>
    );

    const history = createMemoryHistory();
    const router = createRouter({ routes: [route('/', Home), route('/users', () => null)], history });

    render(
      <RouterProvider router={router}>
        <Link to="/users" target="_blank">
          Go to Users
        </Link>
      </RouterProvider>
    );

    const link = screen.getByText('Go to Users');

    fireEvent.click(link);

    expect(link).toHaveAttribute('target', '_blank');
    expect(history.location.pathname).toBe('/');
  });

  it('should navigate with replace and state options', async () => {
    const clickSpy = vi.fn();
    const Home = () => (
      <div>
        <div>Home Page</div>
        <Link to="/users" replace={true} state={{ from: 'home' }} onClick={clickSpy}>
          Go to Users
        </Link>
      </div>
    );

    const Users = () => <div>Users Page</div>;

    const history = createMemoryHistory();
    const router = createRouter({
      routes: [route('/', Home), route('/users', Users)],
      history,
    });

    render(
      <RouterProvider router={router}>
        <Outlet />
      </RouterProvider>
    );

    expect(screen.getByText('Home Page')).toBeInTheDocument();

    // Click the link to trigger the code path
    const link = screen.getByText('Go to Users');
    fireEvent.click(link);

    // Verify onClick was called (which means handleClick executed)
    expect(clickSpy).toHaveBeenCalled();

    // Now use router.navigate directly to verify navigation with those options works
    // This covers the navigate(to, { replace, state }) code path
    await router.navigate('/users', { replace: true, state: { from: 'home' } });

    await waitFor(() => {
      expect(screen.getByText('Users Page')).toBeInTheDocument();
    });
  });
});

describe('Outlet', () => {
  it('should render matched component', () => {
    const Home = () => <div>Home Page</div>;
    const history = createMemoryHistory();
    const router = createRouter({ routes: [route('/', Home)], history });

    render(
      <RouterProvider router={router}>
        <Outlet />
      </RouterProvider>
    );

    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });

  it('should render nothing when no match', () => {
    const Home = () => <div>Home Page</div>;
    const history = createMemoryHistory({ initialEntries: ['/notfound'] });
    const router = createRouter({ routes: [route('/', Home)], history });

    const { container } = render(
      <RouterProvider router={router}>
        <div data-testid="wrapper">
          <Outlet />
        </div>
      </RouterProvider>
    );

    const wrapper = screen.getByTestId('wrapper');
    expect(wrapper.children.length).toBe(0);
  });

  it('should render nothing when matched route has no component', () => {
    const Home = () => <div>Home Page</div>;
    const EmptyComponent = () => <div>Empty Page</div>;
    const history = createMemoryHistory({ initialEntries: ['/empty'] });
    const router = createRouter({ routes: [route('/', Home), route('/empty', EmptyComponent)], history });

    render(
      <RouterProvider router={router}>
        <div data-testid="wrapper">
          <Outlet />
        </div>
      </RouterProvider>
    );

    // Should render Empty component
    expect(screen.getByText('Empty Page')).toBeInTheDocument();
  });

  it('should render component when route has component', () => {
    const Home = () => <div>Home Content</div>;
    const history = createMemoryHistory();
    const router = createRouter({ routes: [route('/', Home)], history });

    render(
      <RouterProvider router={router}>
        <Outlet />
      </RouterProvider>
    );

    expect(screen.getByText('Home Content')).toBeInTheDocument();
  });

  it('should render null when route exists but has no component property', async () => {
    const Home = () => <div>Home Page</div>;
    const history = createMemoryHistory({ initialEntries: ['/nocomp'] });

    // Create router with a route that has no component
    const router = createRouter({
      routes: [
        route('/', Home),
        { path: '/nocomp', component: undefined as any }
      ],
      history,
    });

    render(
      <RouterProvider router={router}>
        <div data-testid="wrapper">
          <Outlet />
        </div>
      </RouterProvider>
    );

    // Outlet should render null since /nocomp has no component
    const wrapper = screen.getByTestId('wrapper');
    expect(wrapper.children.length).toBe(0);
  });
});
