import React from 'react';
import { useSearch } from '@oxog/routely-plugin-search';
import { products as allProducts, categories, addToCart } from '../main';

interface ShopParams {
  category?: string;
  search?: string;
  sort?: 'name' | 'price';
}

export default function Products() {
  const { search, setSearch } = useSearch<ShopParams>();
  const category = search.category || 'all';
  const searchQuery = search.search || '';
  const sort = search.sort || 'name';

  // Filter products
  let filtered = allProducts;
  if (category !== 'all') {
    filtered = filtered.filter(p => p.category === category);
  }
  if (searchQuery) {
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Sort products
  filtered = [...filtered].sort((a, b) => {
    if (sort === 'price') return a.price - b.price;
    return a.name.localeCompare(b.name);
  });

  const updateParam = (key: keyof ShopParams, value: string) => {
    setSearch({ ...search, [key]: value });
  };

  return React.createElement(
    'div',
    null,
    React.createElement('h1', { style: { marginBottom: '30px' } }, 'Products'),
    // Filters
    React.createElement(
      'div',
      {
        style: {
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px',
          display: 'flex',
          gap: '20px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }
      },
      React.createElement('div', null,
        React.createElement('label', { style: { marginRight: '10px', fontWeight: 'bold' } }, 'Category:'),
        React.createElement('select', {
          value: category,
          onChange: e => updateParam('category', e.target.value),
          style: { padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }
        }, categories.map(cat =>
          React.createElement('option', { key: cat, value: cat }, cat.charAt(0).toUpperCase() + cat.slice(1))
        ))
      ),
      React.createElement('div', null,
        React.createElement('label', { style: { marginRight: '10px', fontWeight: 'bold' } }, 'Search:'),
        React.createElement('input', {
          type: 'text',
          value: searchQuery,
          onChange: e => updateParam('search', e.target.value),
          placeholder: 'Search products...',
          style: { padding: '8px', borderRadius: '4px', border: '1px solid #ddd', width: '200px' }
        })
      ),
      React.createElement('div', null,
        React.createElement('label', { style: { marginRight: '10px', fontWeight: 'bold' } }, 'Sort:'),
        React.createElement('select', {
          value: sort,
          onChange: e => updateParam('sort', e.target.value),
          style: { padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }
        },
          React.createElement('option', { value: 'name' }, 'Name'),
          React.createElement('option', { value: 'price' }, 'Price')
        )
      )
    ),
    // Products grid
    React.createElement(
      'div',
      { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' } },
      filtered.map(product =>
        React.createElement(
          'div',
          {
            key: product.id,
            style: {
              background: 'white',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s'
            }
          },
          React.createElement(
            'a',
            { href: `/product/${product.id}`, style: { textDecoration: 'none', color: 'inherit' } },
            React.createElement('div', {
              style: {
                fontSize: '80px',
                textAlign: 'center',
                padding: '40px',
                background: '#f8fafc'
              }
            }, product.image),
            React.createElement('div', { style: { padding: '15px' } },
              React.createElement('h3', { style: { margin: '0 0 10px' } }, product.name),
              React.createElement('p', { style: { color: '#666', fontSize: '14px', marginBottom: '10px' } }, product.description),
              React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                React.createElement('span', { style: { fontSize: '20px', fontWeight: 'bold', color: '#3b82f6' } }, `$${product.price}`),
                React.createElement('span', { style: { fontSize: '12px', padding: '4px 8px', background: '#e0e7ff', borderRadius: '4px' } }, product.category)
              )
            )
          )
        )
      )
    ),
    filtered.length === 0 && React.createElement(
      'div',
      { style: { textAlign: 'center', padding: '60px', color: '#666' } },
      React.createElement('p', { style: { fontSize: '18px' } }, 'No products found matching your criteria.')
    )
  );
}
