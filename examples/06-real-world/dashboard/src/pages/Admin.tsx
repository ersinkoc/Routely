import React from 'react';

export default function Admin() {
  return React.createElement(
    'div',
    null,
    React.createElement('h2', { style: { marginBottom: '20px' } }, 'Admin Panel'),
    React.createElement(
      'div',
      {
        style: {
          background: '#fef3c7',
          border: '1px solid #fbbf24',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px'
        }
      },
      React.createElement('p', { style: { margin: 0, color: '#92400e' } }, '⚠️ Admin-only area. You have administrator privileges.')
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
      React.createElement('h3', { style: { marginBottom: '20px' } }, 'System Configuration'),
      React.createElement('div', { style: { marginBottom: '15px' } },
        React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 'Site Name:'),
        React.createElement('input', {
          type: 'text',
          defaultValue: 'Dashboard App',
          style: {
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '16px'
          }
        })
      ),
      React.createElement('div', { style: { marginBottom: '15px' } },
        React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 'Support Email:'),
        React.createElement('input', {
          type: 'email',
          defaultValue: 'support@dashboard.com',
          style: {
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '16px'
          }
        })
      ),
      React.createElement(
        'button',
        {
          style: {
            padding: '10px 20px',
            background: '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }
        },
        'Save Configuration'
      ),
      React.createElement('hr', { style: { margin: '30px 0', border: 'none', borderTop: '1px solid #e2e8f0' } }),
      React.createElement('h3', { style: { marginBottom: '20px' } }, 'Danger Zone'),
      React.createElement('p', { style: { color: '#666', marginBottom: '15px' } }, 'Irreversible and destructive actions'),
      React.createElement(
        'button',
        {
          style: {
            padding: '10px 20px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }
        },
        'Reset All Data'
      )
    )
  );
}
