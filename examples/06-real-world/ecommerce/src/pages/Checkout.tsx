import React, { useState } from 'react';
import { useNavigate } from '@oxog/routely-core';
import { getCartItems, getCartTotal, clearCart } from '../main';

export default function Checkout() {
  const navigate = useNavigate();
  const cartItems = getCartItems();
  const total = getCartTotal();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    clearCart();
    navigate('/success');
  };

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return React.createElement(
    'div',
    null,
    React.createElement('h1', { style: { marginBottom: '30px' } }, 'Checkout'),
    React.createElement(
      'form',
      { onSubmit: handleSubmit },
      React.createElement(
        'div',
        { style: { display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px' } },
        React.createElement(
          'div',
          null,
          React.createElement('h2', { style: { marginBottom: '20px' } }, 'Shipping Information'),
          React.createElement('div', { style: { marginBottom: '15px' } },
            React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 'Full Name:'),
            React.createElement('input', {
              type: 'text',
              value: formData.name,
              onChange: e => setFormData({ ...formData, name: e.target.value }),
              required: true,
              style: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }
            })
          ),
          React.createElement('div', { style: { marginBottom: '15px' } },
            React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 'Email:'),
            React.createElement('input', {
              type: 'email',
              value: formData.email,
              onChange: e => setFormData({ ...formData, email: e.target.value }),
              required: true,
              style: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }
            })
          ),
          React.createElement('div', { style: { marginBottom: '15px' } },
            React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 'Address:'),
            React.createElement('input', {
              type: 'text',
              value: formData.address,
              onChange: e => setFormData({ ...formData, address: e.target.value }),
              required: true,
              style: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }
            })
          ),
          React.createElement('div', { style: { display: 'flex', gap: '15px', marginBottom: '15px' } },
            React.createElement('div', { style: { flex: 1 } },
              React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 'City:'),
              React.createElement('input', {
                type: 'text',
                value: formData.city,
                onChange: e => setFormData({ ...formData, city: e.target.value }),
                required: true,
                style: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }
              })
            ),
            React.createElement('div', { style: { flex: 1 } },
              React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 'ZIP Code:'),
              React.createElement('input', {
                type: 'text',
                value: formData.zipCode,
                onChange: e => setFormData({ ...formData, zipCode: e.target.value }),
                required: true,
                style: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }
              })
            )
          ),
          React.createElement('h2', { style: { marginBottom: '20px', marginTop: '30px' } }, 'Payment Information'),
          React.createElement('div', { style: { marginBottom: '15px' } },
            React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 'Card Number:'),
            React.createElement('input', {
              type: 'text',
              value: formData.cardNumber,
              onChange: e => setFormData({ ...formData, cardNumber: e.target.value }),
              placeholder: '1234 5678 9012 3456',
              required: true,
              style: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }
            })
          ),
          React.createElement('div', { style: { display: 'flex', gap: '15px', marginBottom: '15px' } },
            React.createElement('div', { style: { flex: 1 } },
              React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 'Expiry Date:'),
              React.createElement('input', {
                type: 'text',
                value: formData.expiryDate,
                onChange: e => setFormData({ ...formData, expiryDate: e.target.value }),
                placeholder: 'MM/YY',
                required: true,
                style: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }
              })
            ),
            React.createElement('div', { style: { flex: 1 } },
              React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 'CVV:'),
              React.createElement('input', {
                type: 'text',
                value: formData.cvv,
                onChange: e => setFormData({ ...formData, cvv: e.target.value }),
                placeholder: '123',
                required: true,
                style: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }
              })
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
            cartItems.map(item =>
              React.createElement(
                'div',
                {
                  key: item.id,
                  style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '10px',
                    paddingBottom: '10px',
                    borderBottom: '1px solid #f1f5f9'
                  }
                },
                React.createElement('span', null, `${item.name} x${item.quantity}`),
                React.createElement('span', null, `$${item.price * item.quantity}`)
              )
            ),
            React.createElement('hr', { style: { margin: '15px 0', border: 'none', borderTop: '1px solid #e2e8f0' } }),
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold' } },
              React.createElement('span', null, 'Total:'),
              React.createElement('span', { style: { color: '#3b82f6' } }, `$${total}`)
            ),
            React.createElement(
              'button',
              {
                type: 'submit',
                disabled: isProcessing,
                style: {
                  width: '100%',
                  padding: '15px',
                  background: isProcessing ? '#999' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  marginTop: '20px'
                }
              },
              isProcessing ? 'Processing...' : 'Place Order'
            )
          )
        )
      )
    );
  );
}
