import React from 'react';
import { useParams } from '@oxog/routely-core';

interface UserParams {
  userId: string;
}

export default function UserDetail() {
  const { userId } = useParams<UserParams>();

  return React.createElement(
    'div',
    null,
    React.createElement('h2', null, 'User Detail'),
    React.createElement('p', null, `Viewing user with ID: ${userId}`),
    React.createElement('p', null, React.createElement('a', { href: `/users/${userId}/posts` }, 'View Posts')),
    React.createElement('br', null),
    React.createElement('a', { href: '/users' }, 'Back to Users')
  );
}
