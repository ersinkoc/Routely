/**
 * React Query Integration Example
 * 
 * This example demonstrates how to integrate Routely with React Query
 * for data fetching, caching, and state management.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { createRouter, route, Outlet, useNavigate, useLocation } from '@oxog/routely-core';
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
    },
  },
});

// Mock API functions
const mockUsers = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'user' },
];

const mockPosts = [
  { id: '1', userId: '1', title: 'First Post', content: 'This is the first post' },
  { id: '2', userId: '1', title: 'Second Post', content: 'This is the second post' },
  { id: '3', userId: '2', title: 'Jane\'s Post', content: 'This is Jane\'s post' },
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// API functions
async function fetchUsers() {
  await delay(500);
  return mockUsers;
}

async function fetchUser(userId: string) {
  await delay(300);
  const user = mockUsers.find(u => u.id === userId);
  if (!user) throw new Error('User not found');
  return user;
}

async function fetchUserPosts(userId: string) {
  await delay(400);
  return mockPosts.filter(p => p.userId === userId);
}

async function updateUser(userId: string, data: { name?: string; email?: string }) {
  await delay(600);
  const user = mockUsers.find(u => u.id === userId);
  if (!user) throw new Error('User not found');
  Object.assign(user, data);
  return user;
}

// Custom hook for prefetching data on route hover
function usePrefetchOnHover() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor && anchor.href) {
        const url = new URL(anchor.href);
        const path = url.pathname;

        // Prefetch user data if navigating to user detail
        const userIdMatch = path.match(/^\/users\/([^/]+)$/);
        if (userIdMatch) {
          const userId = userIdMatch[1];
          queryClient.prefetchQuery({
            queryKey: ['user', userId],
            queryFn: () => fetchUser(userId),
          });
        }

        // Prefetch posts if navigating to user posts
        const postsMatch = path.match(/^\/users\/([^/]+)\/posts$/);
        if (postsMatch) {
          const userId = postsMatch[1];
          queryClient.prefetchQuery({
            queryKey: ['user', userId, 'posts'],
            queryFn: () => fetchUserPosts(userId),
          });
        }
      }
    };

    document.addEventListener('mouseenter', handleMouseEnter, true);
    return () => document.removeEventListener('mouseenter', handleMouseEnter, true);
  }, [queryClient]);
}

// Pages
function Home() {
  const navigate = useNavigate();
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  return React.createElement(
    'div',
    null,
    React.createElement('h2', null, 'React Query Integration'),
    React.createElement(
      'p',
      null,
      'This example shows how to integrate Routely with React Query for data fetching.'
    ),
    React.createElement(
      'div',
      { style: { marginBottom: '20px', padding: '15px', background: '#e3f2fd', borderRadius: '4px' } },
      React.createElement('h3', null, 'Features:'),
      React.createElement('ul', null,
        React.createElement('li', null, 'Data fetching with useQuery'),
        React.createElement('li', null, 'Mutations with useMutation'),
        React.createElement('li', null, 'Prefetching on link hover'),
        React.createElement('li', null, 'Cache management'),
        React.createElement('li', null, 'Loading and error states')
      )
    ),
    React.createElement('h3', null, 'Users:'),
    isLoading && React.createElement('p', null, 'Loading...'),
    error && React.createElement('p', { style: { color: 'red' } }, 'Error loading users'),
    users && React.createElement(
      'ul',
      null,
      users.map(user =>
        React.createElement(
          'li',
          { key: user.id },
          React.createElement('a', { href: `/users/${user.id}` }, `${user.name} (${user.role})`)
        )
      )
    )
  );
}

function UserDetail() {
  const { userId } = useParams<{ userId: string }>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    enabled: !!userId,
  });

  const updateMutation = useMutation({
    mutationFn: (data: { name: string; email: string }) => updateUser(userId, data),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const [editing, setEditing] = React.useState(false);
  const [name, setName] = React.useState(user?.name || '');
  const [email, setEmail] = React.useState(user?.email || '');

  React.useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  return React.createElement(
    'div',
    null,
    React.createElement('h2', null, 'User Detail'),
    isLoading && React.createElement('p', null, 'Loading...'),
    error && React.createElement('p', { style: { color: 'red' } }, 'Error loading user'),
    user && React.createElement(
      React.Fragment,
      null,
      editing
        ? React.createElement(
            'div',
            { style: { padding: '15px', background: '#fff3e0', borderRadius: '4px', marginBottom: '20px' } },
            React.createElement('h3', null, 'Edit User'),
            React.createElement('div', { style: { marginBottom: '10px' } },
              React.createElement('label', null, 'Name:'),
              React.createElement('br', null),
              React.createElement('input', {
                type: 'text',
                value: name,
                onChange: e => setName(e.target.value),
                style: { padding: '5px', width: '300px' }
              })
            ),
            React.createElement('div', { style: { marginBottom: '10px' } },
              React.createElement('label', null, 'Email:'),
              React.createElement('br', null),
              React.createElement('input', {
                type: 'email',
                value: email,
                onChange: e => setEmail(e.target.value),
                style: { padding: '5px', width: '300px' }
              })
            ),
            React.createElement(
              'button',
              {
                onClick: () => updateMutation.mutate({ name, email }),
                disabled: updateMutation.isPending,
                style: { padding: '5px 15px', marginRight: '10px' }
              },
              updateMutation.isPending ? 'Saving...' : 'Save'
            ),
            React.createElement(
              'button',
              {
                onClick: () => setEditing(false),
                style: { padding: '5px 15px' }
              },
              'Cancel'
            )
          )
        : React.createElement(
            'div',
            { style: { padding: '15px', background: '#f5f5f5', borderRadius: '4px', marginBottom: '20px' } },
            React.createElement('p', null, React.createElement('strong', null, 'ID: '), user.id),
            React.createElement('p', null, React.createElement('strong', null, 'Name: '), user.name),
            React.createElement('p', null, React.createElement('strong', null, 'Email: '), user.email),
            React.createElement('p', null, React.createElement('strong', null, 'Role: '), user.role),
            React.createElement(
              'button',
              {
                onClick: () => setEditing(true),
                style: { padding: '5px 15px', marginTop: '10px' }
              },
              'Edit'
            )
          ),
      React.createElement('a', { href: `/users/${userId}/posts` }, 'View Posts'),
      React.createElement('br', null),
      React.createElement('a', { href: '/users' }, 'Back to Users')
    )
  );
}

function UserPosts() {
  const { userId } = useParams<{ userId: string }>();

  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });

  const { data: posts, isLoading } = useQuery({
    queryKey: ['user', userId, 'posts'],
    queryFn: () => fetchUserPosts(userId),
    enabled: !!userId,
  });

  return React.createElement(
    'div',
    null,
    React.createElement('h2', null, user ? `${user.name}'s Posts` : 'User Posts'),
    isLoading && React.createElement('p', null, 'Loading posts...'),
    posts && React.createElement(
      'ul',
      null,
      posts.map(post =>
        React.createElement(
          'li',
          { key: post.id, style: { marginBottom: '15px', padding: '10px', background: '#f9f9f9', borderRadius: '4px' } },
          React.createElement('h4', null, post.title),
          React.createElement('p', null, post.content)
        )
      )
    ),
    React.createElement('br', null),
    React.createElement('a', { href: '/users' }, 'Back to Users')
  );
}

// Helper useParams hook
function useParams<T>() {
  const location = useLocation();
  const params: Record<string, string> = {};
  
  const match = location.route?.path?.match(/:([^/]+)/g);
  const segments = location.route?.path?.split('/') || [];
  const pathSegments = location.pathname?.split('/') || [];
  
  segments.forEach((segment, index) => {
    if (segment.startsWith(':')) {
      const paramName = segment.slice(1);
      params[paramName] = pathSegments[index] || '';
    }
  });
  
  return params as T;
}

// Routes
const routes = [
  route('/', () => import('./pages/Home')),
  route('/users', () => import('./pages/Users')),
  route('/users/:userId', () => import('./pages/UserDetail')),
  route('/users/:userId/posts', () => import('./pages/UserPosts')),
];

// Create router
const router = createRouter({ routes });

// Layout with prefetch hook
function Layout() {
  usePrefetchOnHover();
  
  return React.createElement(
    'div',
    { style: { fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px' } },
    React.createElement(
      'header',
      null,
      React.createElement('h1', null, 'Routely + React Query'),
      React.createElement(
        'nav',
        { style: { marginBottom: '20px' } },
        React.createElement('a', { href: '/', style: { marginRight: '15px' } }, 'Home'),
        React.createElement('a', { href: '/users' }, 'Users')
      )
    ),
    React.createElement('main', null, React.createElement(Outlet))
  );
}

// Mount app
ReactDOM.createRoot(document.getElementById('root')!).render(
  React.createElement(
    QueryClientProvider,
    { client: queryClient },
    React.createElement(
      Layout,
      null,
      React.createElement(router.RouterProvider, { router })
    )
  )
);
