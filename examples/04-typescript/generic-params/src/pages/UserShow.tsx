import React from 'react';
import { useTypedParams } from '../main';

export default function UserShow() {
  const params = useTypedParams<'/users/:userId'>();
  
  return React.createElement(
    'div',
    null,
    React.createElement('h2', null, 'User Detail'),
    React.createElement('div', { style: { padding: '15px', background: '#e3f2fd', borderRadius: '4px', marginBottom: '20px' } },
      React.createElement('strong', null, 'Typed Parameters:'),
      React.createElement('br', null),
      React.createElement('code', null, `userId: "${params.userId}" (type: string)`)
    ),
    React.createElement('p', null, 'The params object is fully typed as: { userId: string }'),
    React.createElement('p', null, React.createElement('a', { href: `/users/${params.userId}/posts` }, 'View Posts')),
    React.createElement('br', null),
    React.createElement('a', { href: '/users' }, 'Back to Users')
  );
}
