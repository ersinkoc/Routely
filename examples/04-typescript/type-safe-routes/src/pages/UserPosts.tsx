import React from 'react';
import { useParams } from '@oxog/routely-core';

interface UserPostsParams {
  userId: string;
}

export default function UserPosts() {
  const { userId } = useParams<UserPostsParams>();

  return React.createElement(
    'div',
    null,
    React.createElement('h2', null, 'User Posts'),
    React.createElement('p', null, `Viewing posts for user ID: ${userId}`),
    React.createElement(
      'ul',
      null,
      React.createElement('li', null, React.createElement('a', { href: `/users/${userId}/posts/1` }, 'Post 1')),
      React.createElement('li', null, React.createElement('a', { href: `/users/${userId}/posts/2` }, 'Post 2'))
    ),
    React.createElement('br', null),
    React.createElement('a', { href: '/users' }, 'Back to Users')
  );
}
