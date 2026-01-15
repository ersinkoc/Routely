import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from '@oxog/routely-core';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockUsers: Record<string, { id: string; name: string; email: string; role: string }> = {
  '1': { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' },
  '2': { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
  '3': { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'user' },
};

async function fetchUser(userId: string) {
  await delay(300);
  const user = mockUsers[userId];
  if (!user) throw new Error('User not found');
  return user;
}

async function updateUser(userId: string, data: { name?: string; email?: string }) {
  await delay(600);
  const user = mockUsers[userId];
  if (!user) throw new Error('User not found');
  Object.assign(user, data);
  return user;
}

export default function UserDetail() {
  const { userId } = useParams<{ userId: string }>();
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId!),
    enabled: !!userId,
  });

  const updateMutation = useMutation({
    mutationFn: (data: { name: string; email: string }) => updateUser(userId!, data),
    onSuccess: () => {
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
