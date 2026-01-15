import React from 'react';
import { useParams } from '@oxog/routely-core';
import { mockUsers } from '../main';

export default function UserDetail() {
  const { userId } = useParams<{ userId: string }>();
  const user = mockUsers.find(u => u.id === userId);

  if (!user) {
    return React.createElement(
      'div',
      null,
      React.createElement('h2', null, 'User Not Found'),
      React.createElement('a', { href: '/dashboard/users' }, 'Back to Users')
    );
  }

  return React.createElement(
    'div',
    null,
    React.createElement('div', { style: { marginBottom: '20px' } },
      React.createElement('a', { href: '/dashboard/users', style: { color: '#3b82f6', textDecoration: 'none' } }, '← Back to Users')
    ),
    React.createElement(
      'div',
      {
        style: {
          background: 'white',
          padding: '30px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }
      },
      React.createElement('h2', { style: { marginBottom: '20px' } }, 'User Details'),
      React.createElement(
        'div',
        { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' } },
        React.createElement(
          'div',
          null,
          React.createElement('p', { style: { fontSize: '14px', color: '#666', marginBottom: '5px' } }, 'ID'),
          React.createElement('p', { style: { fontSize: '18px', fontWeight: 'bold' } }, user.id)
        ),
        React.createElement(
          'div',
          null,
          React.createElement('p', { style: { fontSize: '14px', color: '#666', marginBottom: '5px' } }, 'Name'),
          React.createElement('p', { style: { fontSize: '18px', fontWeight: 'bold' } }, user.name)
        ),
        React.createElement(
          'div',
          null,
          React.createElement('p', { style: { fontSize: '14px', color: '#666', marginBottom: '5px' } }, 'Email'),
          React.createElement('p', { style: { fontSize: '18px' } }, user.email)
        ),
        React.createElement(
          'div',
          null,
          React.createElement('p', { style: { fontSize: '14px', color: '#666', marginBottom: '5px' } }, 'Role'),
          React.createElement('span', {
            style: {
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '14px',
              background: user.role === 'admin' ? '#fef3c7' : user.role === 'viewer' ? '#e0e7ff' : '#d1fae5',
              color: user.role === 'admin' ? '#92400e' : user.role === 'viewer' ? '#3730a3' : '#065f46'
            }
          }, user.role)
        )
      )
    )
  );
}
