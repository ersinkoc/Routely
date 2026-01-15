import React from 'react';
import { useNavigate } from '@oxog/routely-core';

export default function Success() {
  const navigate = useNavigate();

  return React.createElement(
    'div',
    {
      style: {
        textAlign: 'center',
        padding: '60px 20px',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        maxWidth: '500px',
        margin: '0 auto'
      }
    },
    React.createElement('div', { style: { fontSize: '80px', marginBottom: '20px' } }, '✅'),
    React.createElement('h1', { style: { color: '#10b981', marginBottom: '15px' } }, 'Order Placed Successfully!'),
    React.createElement('p', { style: { color: '#666', marginBottom: '30px' } }, 'Thank you for your purchase. Your order is being processed and will be shipped soon.'),
    React.createElement(
      'button',
      {
        onClick: () => navigate('/'),
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
      'Continue Shopping'
    )
  );
}
