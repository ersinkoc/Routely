import React from 'react';

export default function Users() {
  return React.createElement(
    'div',
    null,
    React.createElement('h2', null, 'Users'),
    React.createElement('p', null, 'Select a user:'),
    React.createElement(
      'ul',
      null,
      React.createElement('li', null, React.createElement('a', { href: '/users/1' }, 'User 1')),
      React.createElement('li', null, React.createElement('a', { href: '/users/2' }, 'User 2')),
      React.createElement('li', null, React.createElement('a', { href: '/users/3' }, 'User 3'))
    )
  );
}
