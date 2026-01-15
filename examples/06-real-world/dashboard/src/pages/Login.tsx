import React from 'react';
import { useNavigate } from '@oxog/routely-core';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('admin@dashboard.com');
  const [password, setPassword] = React.useState('password');
  const [loading, setLoading] = React.useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Set auth state
    const role = email.includes('admin') ? 'admin' : email.includes('viewer') ? 'viewer' : 'user';
    (globalThis as any).isAuthenticated = true;
    (globalThis as any).currentUser = {
      id: role === 'admin' ? '1' : role === 'viewer' ? '3' : '2',
      name: `${role.charAt(0).toUpperCase() + role.slice(1)} User`,
      email,
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
          width: '350px'
        }
      },
      React.createElement('h1', { style: { textAlign: 'center', marginBottom: '30px' } }, 'Login'),
      React.createElement(
        'form',
        { onSubmit: handleLogin },
        React.createElement('div', { style: { marginBottom: '20px' } },
          React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 'Email:'),
          React.createElement('input', {
            type: 'email',
            value: email,
            onChange: e => setEmail(e.target.value),
            required: true,
            style: {
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '16px'
            }
          })
        ),
        React.createElement('div', { style: { marginBottom: '20px' } },
          React.createElement('label', { style: { display: 'block', marginBottom: '5px', fontWeight: 'bold' } }, 'Password:'),
          React.createElement('input', {
            type: 'password',
            value: password,
            onChange: e => setPassword(e.target.value),
            required: true,
            style: {
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '16px'
            }
          })
        ),
        React.createElement(
          'button',
          {
            type: 'submit',
            disabled: loading,
            style: {
              width: '100%',
              padding: '12px',
              background: loading ? '#999' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer'
            }
          },
          loading ? 'Logging in...' : 'Login'
        )
      ),
      React.createElement('p', { style: { marginTop: '20px', fontSize: '14px', color: '#666' } },
        'Demo: admin@dashboard.com / password'
      )
    )
  );
}
