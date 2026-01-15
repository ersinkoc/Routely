import React from 'react';

export default function ProfileSettings() {
  return React.createElement(
    'div',
    null,
    React.createElement('h3', null, 'Profile Settings'),
    React.createElement('p', null, 'Edit your profile information.'),
    React.createElement('div', { style: { marginTop: '20px' } },
      React.createElement('label', null, 'Name:'),
      React.createElement('br', null),
      React.createElement('input', { type: 'text', defaultValue: 'John Doe' }),
      React.createElement('br', { style: { marginTop: '10px' } }),
      React.createElement('label', null, 'Email:'),
      React.createElement('br', null),
      React.createElement('input', { type: 'email', defaultValue: 'john@example.com' })
    )
  );
}
