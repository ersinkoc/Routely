import React from 'react';
import { useParams } from '@oxog/routely-core';
import { products as allProducts, addToCart } from '../main';

export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const product = allProducts.find(p => p.id === productId);

  if (!product) {
    return React.createElement(
      'div',
      null,
      React.createElement('h1', null, 'Product Not Found'),
      React.createElement('a', { href: '/' }, '← Back to Products')
    );
  }

  const relatedProducts = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return React.createElement(
    'div',
    null,
    React.createElement('a', { href: '/', style: { color: '#3b82f6', textDecoration: 'none', marginBottom: '20px', display: 'inline-block' } }, '← Back to Products'),
    React.createElement(
      'div',
      {
        style: {
          background: 'white',
          borderRadius: '8px',
          padding: '40px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '40px'
        }
      },
      React.createElement('div', {
        style: {
          fontSize: '150px',
          textAlign: 'center',
          padding: '60px',
          background: '#f8fafc',
          borderRadius: '8px'
        }
      }, product.image),
      React.createElement('div', null,
        React.createElement('span', {
          style: {
            fontSize: '12px',
            padding: '4px 8px',
            background: '#e0e7ff',
            borderRadius: '4px',
            color: '#4338ca'
          }
        }, product.category),
        React.createElement('h1', { style: { fontSize: '32px', margin: '15px 0' } }, product.name),
        React.createElement('p', { style: { fontSize: '24px', color: '#3b82f6', fontWeight: 'bold', marginBottom: '20px' } }, `$${product.price}`),
        React.createElement('p', { style: { color: '#666', lineHeight: '1.6', marginBottom: '30px' } }, product.description),
        React.createElement(
          'button',
          {
            onClick: () => {
              addToCart(product);
              alert(`${product.name} added to cart!`);
            },
            style: {
              padding: '15px 30px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }
          },
          'Add to Cart'
        )
      )
    ),
    relatedProducts.length > 0 && React.createElement(
      'div',
      { style: { marginTop: '40px' } },
      React.createElement('h2', { style: { marginBottom: '20px' } }, 'Related Products'),
      React.createElement(
        'div',
        { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' } },
        relatedProducts.map(p =>
          React.createElement(
            'a',
            { key: p.id, href: `/product/${p.id}`, style: { textDecoration: 'none', color: 'inherit' } },
            React.createElement(
              'div',
              {
                style: {
                  background: 'white',
                  borderRadius: '8px',
                  padding: '15px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  textAlign: 'center'
                }
              },
              React.createElement('div', { style: { fontSize: '50px', marginBottom: '10px' } }, p.image),
              React.createElement('h3', { style: { fontSize: '16px', margin: '0 0 5px' } }, p.name),
              React.createElement('p', { style: { color: '#3b82f6', fontWeight: 'bold', margin: 0 } }, `$${p.price}`)
            )
          )
        )
      )
    )
  );
}
