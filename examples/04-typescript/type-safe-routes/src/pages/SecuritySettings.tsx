import React from 'react';

export default function SecuritySettings() {
  return React.createElement(
    'div',
    null,
    React.createElement('h3', null, 'Security Settings'),
    React.createElement('p', null, 'Manage your security preferences.'),
    React.createElement('div', { style: { marginTop: '20px' } },
      React.createElement('label', null, 'Current Password:'),
      React.createElement('br', null),
      React.createElement('input', { type: 'password' }),
      React.createElement('br', { style: { marginTop: '10px' } }),
      React.createElement('label', null, 'New Password:'),
      React.createElement('br', null),
      React.createElement('input', { type: 'password' }),
      React.createElement('br', { style: { marginTop: '10px' } }),
      React.createElement('label', null, 'Confirm Password:'),
      React.createElement('br', null),
      React.createElement('input', { type: 'password' })
    )
  );
}
