import React from 'react';
import { Outlet } from '@oxog/routely-core';

export default function Settings() {
  return React.createElement(
    'div',
    null,
    React.createElement('h2', null, 'Settings'),
    React.createElement(
      'nav',
      { style: { marginBottom: '20px', padding: '10px', background: '#f5f5f5', borderRadius: '4px' } },
      React.createElement('a', { href: '/settings/profile' }, 'Profile'),
      ' | ',
      React.createElement('a', { href: '/settings/security' }, 'Security')
    ),
    React.createElement(Outlet)
  );
}
