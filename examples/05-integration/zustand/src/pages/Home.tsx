import React from 'react';
import { useNavigate } from '@oxog/routely-core';
import { useAuthStore, useCartStore, useNavigationStore } from '../main';

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { items } = useCartStore();
  const { currentPath, history } = useNavigationStore();

  return React.createElement(
    'div',
    null,
    React.createElement('h2', null, 'Zustand Integration'),
    React.createElement(
      'p',
      null,
      'This example demonstrates Routely integrated with Zustand for state management.'
    ),
    React.createElement(
      'div',
      { style: { marginBottom: '20px', padding: '15px', background: '#e3f2fd', borderRadius: '4px' } },
      React.createElement('h3', null, 'Global State:'),
      React.createElement('p', null, `Current Path: ${currentPath}`),
      React.createElement('p', null, `History Length: ${history.length}`),
      React.createElement('p', null, `Auth: ${isAuthenticated ? `Logged in as ${user?.name}` : 'Not logged in'}`),
      React.createElement('p', null, `Cart Items: ${items.length}`)
    ),
    React.createElement('h3', null, 'Examples:'),
    React.createElement(
      'ul',
      null,
      React.createElement('li', null, React.createElement('a', { href: '/auth' }, 'Authentication Flow')),
      React.createElement('li', null, React.createElement('a', { href: '/shop' }, 'Shopping Cart')),
      React.createElement('li', null, React.createElement('a', { href: '/history' }, 'Navigation History'))
    )
  );
}
