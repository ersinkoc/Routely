import React from 'react';

export default function ProductList() {
  return React.createElement(
    'div',
    null,
    React.createElement('h2', null, 'Products'),
    React.createElement('p', null, 'Product list with generic parameter handling.'),
    React.createElement(
      'ul',
      null,
      React.createElement('li', null, React.createElement('a', { href: '/products/1' }, 'Product 1')),
      React.createElement('li', null, React.createElement('a', { href: '/products/2' }, 'Product 2')),
      React.createElement('li', null, React.createElement('a', { href: '/products/3' }, 'Product 3'))
    ),
    React.createElement('br', null),
    React.createElement('a', { href: '/' }, 'Back to Home')
  );
}
