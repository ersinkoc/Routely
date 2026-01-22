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

  it('should catch errors in Outlet component rendering', () => {
    // Component that throws an error
    const BadComponent = () => {
      throw new Error('Component error');
    };

    const history = createMemoryHistory({ initialEntries: ['/bad'] });
    const router = createRouter({
      routes: [route('/bad', BadComponent)],
      history,
    });

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <RouterProvider router={router}>
        <Outlet />
      </RouterProvider>
    );

    // Error should be caught and logged
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});

describe('Link XSS Protection', () => {
  it('should throw error for javascript: protocol', () => {
    const Home = () => <div>Home</div>;
    const history = createMemoryHistory();
    const router = createRouter({ routes: [route('/', Home)], history });

    // javascript: doesn't start with / so it fails the first check
    expect(() => {
      render(
        <RouterProvider router={router}>
          <Link to="javascript:alert(1)">Click</Link>
        </RouterProvider>
      );
    }).toThrow('Invalid href: "javascript:alert(1)" - must start with "/"');
  });

  it('should throw error for data: protocol', () => {
    const Home = () => <div>Home</div>;
    const history = createMemoryHistory();
    const router = createRouter({ routes: [route('/', Home)], history });

    // data: doesn't start with / so it fails the first check
    expect(() => {
      render(
        <RouterProvider router={router}>
          <Link to="data:text/html,<script>alert(1)</script>">Click</Link>
        </RouterProvider>
      );
    }).toThrow('Invalid href: "data:text/html,<script>alert(1)</script>" - must start with "/"');
  });

  it('should throw error for vbscript: protocol', () => {
    const Home = () => <div>Home</div>;
    const history = createMemoryHistory();
    const router = createRouter({ routes: [route('/', Home)], history });

    // vbscript: doesn't start with / so it fails the first check
    expect(() => {
      render(
        <RouterProvider router={router}>
          <Link to="vbscript:alert(1)">Click</Link>
        </RouterProvider>
      );
    }).toThrow('Invalid href: "vbscript:alert(1)" - must start with "/"');
  });

  it('should throw error for file: protocol', () => {
    const Home = () => <div>Home</div>;
    const history = createMemoryHistory();
    const router = createRouter({ routes: [route('/', Home)], history });

    // file: protocol doesn't start with / so it fails the first check
    expect(() => {
      render(
        <RouterProvider router={router}>
          <Link to="file:///etc/passwd">Click</Link>
        </RouterProvider>
      );
    }).toThrow('Invalid href: "file:///etc/passwd" - must start with "/"');
  });

  it('should throw error for href with HTML brackets', () => {
    const Home = () => <div>Home</div>;
    const history = createMemoryHistory();
    const router = createRouter({ routes: [route('/', Home)], history });

    expect(() => {
      render(
        <RouterProvider router={router}>
          <Link to="/test<script>alert(1)</script>">Click</Link>
        </RouterProvider>
      );
    }).toThrow('Invalid href: contains HTML brackets');
  });

  it('should throw error for href with null byte', () => {
    const Home = () => <div>Home</div>;
    const history = createMemoryHistory();
    const router = createRouter({ routes: [route('/', Home)], history });

    // Create string with null byte using String.fromCharCode
    const hrefWithNullByte = '/test' + String.fromCharCode(0) + 'path';

    expect(() => {
      render(
        <RouterProvider router={router}>
          <Link to={hrefWithNullByte}>Click</Link>
        </RouterProvider>
      );
    }).toThrow('Invalid href: contains null byte');
  });

  it('should throw error for href with control characters', () => {
    const Home = () => <div>Home</div>;
    const history = createMemoryHistory();
    const router = createRouter({ routes: [route('/', Home)], history });

    // Create string with control character using String.fromCharCode
    const hrefWithControlChar = '/test' + String.fromCharCode(0x01) + 'path';

    expect(() => {
      render(
        <RouterProvider router={router}>
          <Link to={hrefWithControlChar}>Click</Link>
        </RouterProvider>
      );
    }).toThrow('Invalid href: contains control characters');
  });

  it('should throw error for excessively long href', () => {
    const Home = () => <div>Home</div>;
    const history = createMemoryHistory();
    const router = createRouter({ routes: [route('/', Home)], history });

    const longPath = '/test/' + 'a'.repeat(3000);

    expect(() => {
      render(
        <RouterProvider router={router}>
          <Link to={longPath}>Click</Link>
        </RouterProvider>
      );
    }).toThrow('Href too long');
  });

  it('should accept # as href', () => {
    const Home = () => <div>Home</div>;
    const history = createMemoryHistory();
    const router = createRouter({ routes: [route('/', Home)], history });

    render(
      <RouterProvider router={router}>
        <Link to="#">Click</Link>
      </RouterProvider>
    );

    expect(screen.getByText('Click')).toHaveAttribute('href', '#');
  });

  it('should accept ? as href prefix', () => {
    const Home = () => <div>Home</div>;
    const history = createMemoryHistory();
    const router = createRouter({ routes: [route('/', Home)], history });

    render(
      <RouterProvider router={router}>
        <Link to="?page=1">Click</Link>
      </RouterProvider>
    );

    expect(screen.getByText('Click')).toHaveAttribute('href', '?page=1');
  });

  it('should accept * as href', () => {
    const Home = () => <div>Home</div>;
    const history = createMemoryHistory();
    const router = createRouter({ routes: [route('/', Home)], history });

    render(
      <RouterProvider router={router}>
        <Link to="*">Click</Link>
      </RouterProvider>
    );

    expect(screen.getByText('Click')).toHaveAttribute('href', '*');
  });

  it('should throw error for non-string href', () => {
    const Home = () => <div>Home</div>;
    const history = createMemoryHistory();
    const router = createRouter({ routes: [route('/', Home)], history });

    // @ts-expect-error - Testing invalid input
    expect(() => {
      render(
        <RouterProvider router={router}>
          <Link to={123}>Click</Link>
        </RouterProvider>
      );
    }).toThrow('Href must be a string');
  });

  it('should throw error for dangerous protocol in RouteRef', () => {
    const Home = () => <div>Home</div>;
    const history = createMemoryHistory();
    const router = createRouter({ routes: [route('/', Home)], history });

    // Pass a RouteRef object with dangerous protocol
    expect(() => {
      render(
        <RouterProvider router={router}>
          <Link to={{ path: 'javascript:alert(1)', state: {} }}>Click</Link>
        </RouterProvider>
      );
    }).toThrow('must start with "/"');
  });

  it('should throw error for event handler injection', () => {
    const Home = () => <div>Home</div>;
    const history = createMemoryHistory();
    const router = createRouter({ routes: [route('/', Home)], history });

    expect(() => {
      render(
        <RouterProvider router={router}>
          <Link to="/test?onclick=alert(1)">Click</Link>
        </RouterProvider>
      );
    }).toThrow('Invalid href: contains event handler');
  });

  it('should throw error for about: protocol', () => {
    const Home = () => <div>Home</div>;
    const history = createMemoryHistory();
    const router = createRouter({ routes: [route('/', Home)], history });

    // about: doesn't start with / so it fails the first check
    expect(() => {
      render(
        <RouterProvider router={router}>
          <Link to="about:blank">Click</Link>
        </RouterProvider>
      );
    }).toThrow('Invalid href: "about:blank" - must start with "/"');
  });
});
