import React from 'react';
import { categories } from '../main';

export default function Categories() {
  return React.createElement(
    'div',
    null,
    React.createElement('h1', { style: { fontSize: '36px', marginBottom: '10px' } }, 'Categories'),
    React.createElement('p', { style: { color: '#64748b', marginBottom: '30px' } }, 'Browse posts by category'),
    React.createElement(
      'div',
      { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' } },
      categories.map(category =>
        React.createElement(
          'a',
          {
            key: category.id,
            href: `/category/${category.slug}`,
            style: { textDecoration: 'none', color: 'inherit' }
          },
          React.createElement(
            'div',
            {
              style: {
                background: 'white',
                padding: '30px',
                borderRadius: '12px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                textAlign: 'center',
                transition: 'transform 0.2s'
              }
            },
            React.createElement('h2', { style: { margin: '0 0 10px', color: '#1e293b' } }, category.name),
            React.createElement('p', { style: { color: '#64748b', margin: 0 } }, `${category.count} posts`)
          )
        )
      )
    )
  );
}
