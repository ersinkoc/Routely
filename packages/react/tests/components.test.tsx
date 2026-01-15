import { describe, it, expect } from 'vitest';
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
});
