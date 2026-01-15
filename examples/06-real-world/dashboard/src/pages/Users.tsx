import React from 'react';
import { mockUsers } from '../main';

export default function Users() {
  return React.createElement(
    'div',
    null,
    React.createElement('h2', { style: { marginBottom: '20px' } }, 'Users Management'),
    React.createElement(
      'div',
      {
        style: {
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }
      },
      React.createElement(
        'table',
        { style: { width: '100%', borderCollapse: 'collapse' } },
        React.createElement(
          'thead',
          { style: { background: '#f8fafc' } },
          React.createElement(
            'tr',
            null,
            React.createElement('th', { style: { padding: '15px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' } }, 'ID'),
            React.createElement('th', { style: { padding: '15px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' } }, 'Name'),
            React.createElement('th', { style: { padding: '15px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' } }, 'Email'),
            React.createElement('th', { style: { padding: '15px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' } }, 'Role'),
            React.createElement('th', { style: { padding: '15px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' } }, 'Actions')
          )
        ),
        React.createElement(
          'tbody',
          null,
          mockUsers.map(user =>
            React.createElement(
              'tr',
              { key: user.id, style: { borderBottom: '1px solid #f1f5f9' } },
              React.createElement('td', { style: { padding: '15px' } }, user.id),
              React.createElement('td', { style: { padding: '15px' } }, user.name),
              React.createElement('td', { style: { padding: '15px' } }, user.email),
              React.createElement('td', { style: { padding: '15px' } },
                React.createElement('span', {
                  style: {
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    background: user.role === 'admin' ? '#fef3c7' : user.role === 'viewer' ? '#e0e7ff' : '#d1fae5',
                    color: user.role === 'admin' ? '#92400e' : user.role === 'viewer' ? '#3730a3' : '#065f46'
                  }
                }, user.role)
              ),
              React.createElement('td', { style: { padding: '15px' } },
                React.createElement('a', {
                  href: `/dashboard/users/${user.id}`,
                  style: { color: '#3b82f6', textDecoration: 'none' }
                }, 'View')
              )
            )
          )
        )
      )
    )
  );
}
