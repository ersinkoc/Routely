import React from 'react';
import { useQuery } from '@tanstack/react-query';

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

export default function Users() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  return React.createElement(
    'div',
    null,
    React.createElement('h2', null, 'Users'),
    React.createElement('p', null, 'All users in the system:'),
    isLoading && React.createElement('p', null, 'Loading...'),
    users && React.createElement(
      'ul',
      null,
      users.map(user =>
        React.createElement(
          'li',
          { key: user.id },
          React.createElement('a', { href: `/users/${user.id}` }, `${user.name} (${user.email})`)
        )
      )
    ),
    React.createElement('br', null),
    React.createElement('a', { href: '/' }, 'Back to Home')
  );
}
