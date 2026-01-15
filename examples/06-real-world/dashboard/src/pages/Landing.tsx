import React from 'react';
import { useNavigate } from '@oxog/routely-core';

export default function Landing() {
  const navigate = useNavigate();

  const handleDemoLogin = (role: 'admin' | 'user' | 'viewer') => {
    // Simulate login - in real app, this would be an API call
    const { isAuthenticated, currentUser } = require('../main');
    (globalThis as any).isAuthenticated = true;
    (globalThis as any).currentUser = {
      id: role === 'admin' ? '1' : role === 'user' ? '2' : '3',
      name: `${role.charAt(0).toUpperCase() + role.slice(1)} User`,
      email: `${role}@dashboard.com`,
      role
    };
    navigate('/dashboard');
  };

  return React.createElement(
    'div',
    {
      style: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: 'Arial, sans-serif'
      }
    },
    React.createElement(
      'div',
      {
        style: {
          background: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          textAlign: 'center',
          maxWidth: '400px'
        }
      },
      React.createElement('h1', { style: { marginBottom: '10px' } }, 'Dashboard App'),
      React.createElement('p', { style: { marginBottom: '30px', color: '#666' } }, 'A complete dashboard built with Routely'),
      React.createElement('div', { style: { marginBottom: '20px', textAlign: 'left' } },
        React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 'Select Role:'),
        React.createElement(
          'select',
          {
            id: 'role-select',
            style: {
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '16px'
            }
          },
          React.createElement('option', { value: 'admin' }, 'Admin'),
          React.createElement('option', { value: 'user' }, 'User'),
          React.createElement('option', { value: 'viewer' }, 'Viewer')
        )
      ),
      React.createElement(
        'button',
        {
          onClick: () => {
            const select = document.getElementById('role-select') as HTMLSelectElement;
            handleDemoLogin(select.value as 'admin' | 'user' | 'viewer');
          },
          style: {
            width: '100%',
            padding: '12px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }
        },
        'Enter Dashboard'
      )
    )
  );
}
