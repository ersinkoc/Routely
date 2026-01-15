import React from 'react';

export default function About() {
  return React.createElement(
    'div',
    null,
    React.createElement('h2', null, 'About'),
    React.createElement('p', null, 'This is the about page.'),
    React.createElement('a', { href: '/' }, 'Back to Home')
  );
}
