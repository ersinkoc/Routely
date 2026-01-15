import React, { useEffect, useState } from 'react';
import { useNavigate } from '@oxog/routely-core';
import { getCartItems, getCartTotal, updateQuantity, removeFromCart } from '../main';

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState(getCartItems());
  const [total, setTotal] = useState(getCartTotal());

  useEffect(() => {
    const updateCart = () => {
      setCartItems([...getCartItems()]);
      setTotal(getCartTotal());
    };

    window.addEventListener('cart-update', updateCart);
    return () => window.removeEventListener('cart-update', updateCart);
  }, []);

  if (cartItems.length === 0) {
    return React.createElement(
      'div',
      { style: { textAlign: 'center', padding: '60px' } },
      React.createElement('h2', null, 'Your cart is empty'),
      React.createElement('p', { style: { color: '#666', marginBottom: '20px' } }, 'Add some products to get started!'),
      React.createElement(
        'a',
        { href: '/', style: { padding: '10px 20px', background: '#3b82f6', color: 'white', textDecoration: 'none', borderRadius: '6px' } },
        'Browse Products'
      )
    );
  }

  return React.createElement(
    'div',
    null,
    React.createElement('h1', { style: { marginBottom: '30px' } }, 'Shopping Cart'),
    React.createElement(
      'div',
      { style: { display: 'grid', gridTemplateColumns: '1fr 300px', gap: '30px' } },
      React.createElement(
        'div',
        null,
        cartItems.map(item =>
          React.createElement(
            'div',
            {
              key: item.id,
              style: {
                background: 'white',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '15px',
                display: 'flex',
                gap: '20px',
                alignItems: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }
            },
            React.createElement('div', { style: { fontSize: '50px' } }, item.image),
            React.createElement('div', { style: { flex: 1 } },
              React.createElement('h3', { style: { margin: '0 0 5px' } }, item.name),
              React.createElement('p', { style: { color: '#666', margin: '0 0 10px' } }, item.description)
            ),
            React.createElement('div', { style: { textAlign: 'center' } },
              React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' } },
                React.createElement('button', {
                  onClick: () => updateQuantity(item.id, item.quantity - 1),
                  style: { width: '30px', height: '30px', borderRadius: '4px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }
                }, '-'),
                React.createElement('span', { style: { minWidth: '30px', textAlign: 'center' } }, item.quantity),
                React.createElement('button', {
                  onClick: () => updateQuantity(item.id, item.quantity + 1),
                  style: { width: '30px', height: '30px', borderRadius: '4px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }
                }, '+')
              ),
              React.createElement('p', { style: { fontWeight: 'bold', color: '#3b82f6', margin: '0' } }, `$${item.price * item.quantity}`)
            ),
            React.createElement('button', {
              onClick: () => removeFromCart(item.id),
              style: { padding: '8px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }
            }, 'Remove')
          )
        )
      ),
      React.createElement(
        'div',
        null,
        React.createElement(
          'div',
          {
            style: {
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              position: 'sticky',
              top: '100px'
            }
          },
          React.createElement('h3', { style: { marginTop: 0 } }, 'Order Summary'),
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' } },
            React.createElement('span', null, 'Subtotal:'),
            React.createElement('span', null, `$${total}`)
          ),
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' } },
            React.createElement('span', null, 'Shipping:'),
            React.createElement('span', null, 'Free')
          ),
          React.createElement('hr', { style: { margin: '15px 0', border: 'none', borderTop: '1px solid #e2e8f0' } }),
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' } },
            React.createElement('span', null, 'Total:'),
            React.createElement('span', { style: { color: '#3b82f6' } }, `$${total}`)
          ),
          React.createElement(
            'button',
            {
              onClick: () => navigate('/checkout'),
              style: {
                width: '100%',
                padding: '15px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }
            },
            'Proceed to Checkout'
          )
        )
      )
    )
  );
}
