import React from 'react';

export default function Settings() {
  return React.createElement(
    'div',
    null,
    React.createElement('h2', { style: { marginBottom: '20px' } }, 'Settings'),
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
      React.createElement('h3', { style: { marginBottom: '20px' } }, 'Profile Settings'),
      React.createElement('div', { style: { marginBottom: '15px' } },
        React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 'Name:'),
        React.createElement('input', {
          type: 'text',
          defaultValue: 'Admin User',
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
        React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 'Email:'),
        React.createElement('input', {
          type: 'email',
          defaultValue: 'admin@dashboard.com',
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
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }
        },
        'Save Changes'
      ),
      React.createElement('hr', { style: { margin: '30px 0', border: 'none', borderTop: '1px solid #e2e8f0' } }),
      React.createElement('h3', { style: { marginBottom: '20px' } }, 'Notifications'),
      React.createElement(
        'div',
        { style: { marginBottom: '10px' } },
        React.createElement('input', { type: 'checkbox', id: 'email-notif', defaultChecked: true }),
        React.createElement('label', { htmlFor: 'email-notif', style: { marginLeft: '8px' } }, 'Email notifications')
      ),
      React.createElement(
        'div',
        { style: { marginBottom: '10px' } },
        React.createElement('input', { type: 'checkbox', id: 'push-notif', defaultChecked: true }),
        React.createElement('label', { htmlFor: 'push-notif', style: { marginLeft: '8px' } }, 'Push notifications')
      ),
      React.createElement(
        'div',
        { style: { marginBottom: '10px' } },
        React.createElement('input', { type: 'checkbox', id: 'sms-notif' }),
        React.createElement('label', { htmlFor: 'sms-notif', style: { marginLeft: '8px' } }, 'SMS notifications')
      )
    )
  );
}
