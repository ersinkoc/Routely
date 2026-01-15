import React from 'react';
import { useParams } from '@oxog/routely-core';

interface PostDetailParams {
  userId: string;
  postId: string;
}

export default function PostDetail() {
  const { userId, postId } = useParams<PostDetailParams>();

  return React.createElement(
    'div',
    null,
    React.createElement('h2', null, 'Post Detail'),
    React.createElement('p', null, `User ID: ${userId}, Post ID: ${postId}`),
    React.createElement('p', null, 'This is a specific post.'),
    React.createElement('br', null),
    React.createElement('a', { href: `/users/${userId}/posts` }, 'Back to Posts'),
    React.createElement('br', null),
    React.createElement('a', { href: '/users' }, 'Back to Users')
  );
}
