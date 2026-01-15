import React from 'react';
import { useQuery } from '@tanstack/react-query';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockUsers = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'user' },
];

async function fetchUsers() {
  await delay(500);
  return mockUsers;
}

export default function Home() {
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
