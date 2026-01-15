import React from 'react';
import { useCartStore } from '../main';

export default function ShopPage() {
  const { items, total, addItem, removeItem, updateQuantity } = useCartStore();

  const products = [
    { id: '1', name: 'Laptop', price: 999 },
    { id: '2', name: 'Mouse', price: 29 },
    { id: '3', name: 'Keyboard', price: 79 },
    { id: '4', name: 'Monitor', price: 299 },
  ];

  return React.createElement(
    'div',
    null,
    React.createElement('h2', null, 'Shopping Cart'),
    React.createElement(
      'div',
      { style: { display: 'flex', gap: '20px' } },
      React.createElement(
        'div',
        { style: { flex: 1 } },
        React.createElement('h3', null, 'Products'),
        products.map(product =>
          React.createElement(
            'div',
            {
              key: product.id,
              style: {
                padding: '10px',
                marginBottom: '10px',
                background: '#f5f5f5',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }
            },
            React.createElement(
              'span',
              null,
              `${product.name} - $${product.price}`
            ),
            React.createElement(
              'button',
              {
                onClick: () => addItem(product),
                style: { padding: '5px 10px' }
              },
              'Add to Cart'
            )
          )
        )
      ),
      React.createElement(
        'div',
        { style: { flex: 1, padding: '15px', background: '#fff3e0', borderRadius: '4px' } },
        React.createElement('h3', null, 'Cart'),
        items.length === 0
          ? React.createElement('p', null, 'Your cart is empty')
          : React.createElement(
              React.Fragment,
              null,
              items.map(item =>
                React.createElement(
                  'div',
                  {
                    key: item.id,
                    style: {
                      padding: '10px',
                      marginBottom: '10px',
                      background: '#fff',
                      borderRadius: '4px'
                    }
                  },
                  React.createElement('div', null, item.name),
                  React.createElement('div', null, `$${item.price} each`),
                  React.createElement(
                    'div',
                    { style: { display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' } },
                    React.createElement(
                      'button',
                      {
                        onClick: () => updateQuantity(item.id, Math.max(1, item.quantity - 1)),
                        style: { padding: '2px 8px' }
                      },
                      '-'
                    ),
                    React.createElement('span', null, item.quantity),
                    React.createElement(
                      'button',
                      {
                        onClick: () => updateQuantity(item.id, item.quantity + 1),
                        style: { padding: '2px 8px' }
                      },
                      '+'
                    ),
                    React.createElement(
                      'button',
                      {
                        onClick: () => removeItem(item.id),
                        style: { padding: '2px 8px', marginLeft: '10px', background: '#ef5350', color: 'white', border: 'none' }
                      },
                      '×'
                    )
                  ),
                  React.createElement('div', { style: { marginTop: '5px', fontWeight: 'bold' } }, `$${item.price * item.quantity}`)
                )
              ),
              React.createElement('hr', null),
              React.createElement(
                'div',
                { style: { display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold' } },
                React.createElement('span', null, 'Total:'),
                React.createElement('span', null, `$${total}`)
              )
            )
      )
    ),
    React.createElement('br', null),
    React.createElement('a', { href: '/' }, 'Back to Home')
  );
}
