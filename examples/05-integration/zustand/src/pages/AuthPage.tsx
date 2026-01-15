import React from 'react';
import { useAuthStore } from '../main';

export default function AuthPage() {
  const { isAuthenticated, user, login, logout } = useAuthStore();

  const [email, setEmail] = React.useState('john@example.com');
  const [password, setPassword] = React.useState('password');
  const [loading, setLoading] = React.useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login(email, password);
    } finally {
      setLoading(false);
    }
  };

  return React.createElement(
    'div',
    null,
    React.createElement('h2', null, 'Authentication'),
    React.createElement(
      'div',
      { style: { padding: '15px', background: '#f5f5f5', borderRadius: '4px', marginBottom: '20px' } },
      React.createElement('h3', null, 'Auth Store (with Persistence)'),
      React.createElement('p', null, 'This state is persisted in localStorage using zustand/persist middleware.'),
      React.createElement('p', null, `Status: ${isAuthenticated ? 'Authenticated' : 'Not authenticated'}`),
      isAuthenticated && user && React.createElement(
        'div',
        null,
        React.createElement('p', null, `User: ${user.name}`),
        React.createElement('p', null, `Email: ${user.email}`)
      )
    ),
    !isAuthenticated
      ? React.createElement(
          'div',
          { style: { padding: '15px', background: '#fff3e0', borderRadius: '4px' } },
          React.createElement('h3', null, 'Login'),
          React.createElement('div', { style: { marginBottom: '10px' } },
            React.createElement('label', null, 'Email:'),
            React.createElement('br', null),
            React.createElement('input', {
              type: 'email',
              value: email,
              onChange: e => setEmail(e.target.value),
              style: { padding: '5px', width: '300px' }
            })
          ),
          React.createElement('div', { style: { marginBottom: '10px' } },
            React.createElement('label', null, 'Password:'),
            React.createElement('br', null),
            React.createElement('input', {
              type: 'password',
              value: password,
              onChange: e => setPassword(e.target.value),
              style: { padding: '5px', width: '300px' }
            })
          ),
          React.createElement(
            'button',
            {
              onClick: handleLogin,
              disabled: loading,
              style: { padding: '5px 15px' }
            },
            loading ? 'Logging in...' : 'Login'
          )
        )
      : React.createElement(
          'div',
          { style: { padding: '15px', background: '#c8e6c9', borderRadius: '4px' } },
          React.createElement('p', null, 'You are logged in!'),
          React.createElement(
            'button',
            {
              onClick: logout,
              style: { padding: '5px 15px' }
            },
            'Logout'
          )
        ),
    React.createElement('br', null),
    React.createElement('a', { href: '/' }, 'Back to Home')
  );
}
