import React from 'react';
import { useTypedParams } from '../main';

export default function UserPosts() {
  const params = useTypedParams<'/users/:userId/posts'>();
  
  return React.createElement(
    'div',
    null,
    React.createElement('h2', null, 'User Posts'),
    React.createElement('div', { style: { padding: '15px', background: '#e3f2fd', borderRadius: '4px', marginBottom: '20px' } },
      React.createElement('strong', null, 'Typed Parameters:'),
      React.createElement('br', null),
      React.createElement('code', null, `userId: "${params.userId}" (type: string)`)
    ),
    React.createElement('p', null, `Viewing posts for user: ${params.userId}`),
    React.createElement('ul', null,
      React.createElement('li', null, 'Post 1'),
      React.createElement('li', null, 'Post 2'),
      React.createElement('li', null, 'Post 3')
    ),
    React.createElement('br', null),
    React.createElement('a', { href: '/users' }, 'Back to Users')
  );
}
