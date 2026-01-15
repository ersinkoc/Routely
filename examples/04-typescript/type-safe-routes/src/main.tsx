/**
 * Type-Safe Routes Definition
 * 
 * This example demonstrates how to define routes with full type safety
 * using TypeScript. The route paths and parameters are all typed, providing
 * autocomplete and compile-time checking.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { createRouter, route, Outlet, useNavigate } from '@oxog/routely-core';

// Define route paths as a type for type safety
type RoutePath = 
  | '/'
  | '/about'
  | '/users'
  | `/users/${number}`
  | `/users/${number}/posts`
  | `/users/${number}/posts/${number}`
  | '/settings'
  | '/settings/profile'
  | '/settings/security';

// Define parameter types for each route
interface RouteParams {
  '/': {};
  '/about': {};
  '/users': {};
  '/users/:userId': { userId: string };
  '/users/:userId/posts': { userId: string };
  '/users/:userId/posts/:postId': { userId: string; postId: string };
  '/settings': {};
  '/settings/profile': {};
  '/settings/security': {};
}

// Type-safe navigation function
function navigateTo<Path extends keyof RouteParams>(
  navigate: (path: string) => void,
  path: Path,
  params?: RouteParams[Path]
): void {
  if (!params) {
    navigate(path);
    return;
  }
  
  // Replace parameters in path
  let fullPath = path as string;
  for (const [key, value] of Object.entries(params)) {
    fullPath = fullPath.replace(`:${key}`, value);
  }
  navigate(fullPath);
}

// Pages
function Home() {
  const navigate = useNavigate();
  
  return React.createElement(
    'div',
    null,
    React.createElement('h2', null, 'Type-Safe Routes'),
    React.createElement(
      'p',
      null,
      'Navigate to different routes using type-safe navigation.'
    ),
    React.createElement(
      'div',
      { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
      React.createElement(
        'button',
        { onClick: () => navigateTo(navigate, '/about') },
        'Go to About'
      ),
      React.createElement(
        'button',
        { onClick: () => navigateTo(navigate, '/users') },
        'Go to Users'
      ),
      React.createElement(
        'button',
        { onClick: () => navigateTo(navigate, '/users/:userId', { userId: '123' }) },
        'Go to User 123'
      ),
      React.createElement(
        'button',
        { onClick: () => navigateTo(navigate, '/users/:userId/posts/:postId', { userId: '456', postId: '789' }) },
        'Go to User 456, Post 789'
      ),
      React.createElement(
        'button',
        { onClick: () => navigateTo(navigate, '/settings/profile') },
        'Go to Profile Settings'
      )
    )
  );
}

function About() {
  return React.createElement(
    'div',
    null,
    React.createElement('h2', null, 'About'),
    React.createElement('p', null, 'This is the about page.')
  );
}

function Users() {
  return React.createElement(
    'div',
    null,
    React.createElement('h2', null, 'Users'),
    React.createElement('p', null, 'Select a user:'),
    React.createElement(
      'ul',
      null,
      React.createElement('li', null, React.createElement('a', { href: '/users/1' }, 'User 1')),
      React.createElement('li', null, React.createElement('a', { href: '/users/2' }, 'User 2')),
      React.createElement('li', null, React.createElement('a', { href: '/users/3' }, 'User 3'))
    )
  );
}

function UserDetail() {
  return React.createElement(
    'div',
    null,
    React.createElement('h2', null, 'User Detail'),
    React.createElement('p', null, 'Viewing a specific user.'),
    React.createElement('a', { href: '/users' }, 'Back to Users')
  );
}

function UserPosts() {
  return React.createElement(
    'div',
    null,
    React.createElement('h2', null, 'User Posts'),
    React.createElement('p', null, 'Viewing posts for a specific user.'),
    React.createElement('a', { href: '/users' }, 'Back to Users')
  );
}

function PostDetail() {
  return React.createElement(
    'div',
    null,
    React.createElement('h2', null, 'Post Detail'),
    React.createElement('p', null, 'Viewing a specific post.'),
    React.createElement('a', { href: '/users' }, 'Back to Users')
  );
}

function Settings() {
  return React.createElement(
    'div',
    null,
    React.createElement('h2', null, 'Settings'),
    React.createElement(
      'nav',
      null,
      React.createElement('a', { href: '/settings/profile' }, 'Profile'),
      ' | ',
      React.createElement('a', { href: '/settings/security' }, 'Security')
    ),
    React.createElement(Outlet)
  );
}

function ProfileSettings() {
  return React.createElement(
    'div',
    null,
    React.createElement('h3', null, 'Profile Settings'),
    React.createElement('p', null, 'Edit your profile information.')
  );
}

function SecuritySettings() {
  return React.createElement(
    'div',
    null,
    React.createElement('h3', null, 'Security Settings'),
    React.createElement('p', null, 'Manage your security preferences.')
  );
}

// Define routes with type safety
const routes = [
  route('/', () => import('./pages/Home')),
  route('/about', () => import('./pages/About')),
  route('/users', () => import('./pages/Users')),
  route('/users/:userId', () => import('./pages/UserDetail')),
  route('/users/:userId/posts', () => import('./pages/UserPosts')),
  route('/users/:userId/posts/:postId', () => import('./pages/PostDetail')),
  route('/settings', () => import('./pages/Settings'), [
    route('/settings/profile', () => import('./pages/ProfileSettings')),
    route('/settings/security', () => import('./pages/SecuritySettings')),
  ]),
];

// Create router
const router = createRouter({ routes });

// Layout component
function Layout() {
  return React.createElement(
    'div',
    { style: { fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px' } },
    React.createElement(
      'header',
      null,
      React.createElement('h1', null, 'Routely - Type-Safe Routes'),
      React.createElement(
        'nav',
        { style: { marginBottom: '20px' } },
        React.createElement('a', { href: '/', style: { marginRight: '15px' } }, 'Home'),
        React.createElement('a', { href: '/about', style: { marginRight: '15px' } }, 'About'),
        React.createElement('a', { href: '/users', style: { marginRight: '15px' } }, 'Users'),
        React.createElement('a', { href: '/settings' }, 'Settings')
      )
    ),
    React.createElement('main', null, React.createElement(Outlet))
  );
}

// Mount app
ReactDOM.createRoot(document.getElementById('root')!).render(
  React.createElement(
    Layout,
    null,
    React.createElement(router.RouterProvider, { router })
  )
);

// Export types for use in other modules
export type { RoutePath, RouteParams, navigateTo };
