import React from 'react';

export default function Home() {
  return React.createElement(
    'div',
    null,
    React.createElement('h2', null, 'Welcome to Routely Search Parameters'),
    React.createElement(
      'p',
      null,
      'This example demonstrates type-safe URL search parameters using the ',
      React.createElement('code', null, 'useSearch()'),
      ' hook from the search plugin.'
    ),
    React.createElement(
      'p',
      null,
      React.createElement('a', { href: '/products' }, 'Go to Products page →')
    )
  );
}
