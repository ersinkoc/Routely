import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from '@oxog/routely-core';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockUsers: Record<string, { id: string; name: string }> = {
  '1': { id: '1', name: 'John Doe' },
  '2': { id: '2', name: 'Jane Smith' },
  '3': { id: '3', name: 'Bob Johnson' },
};

const mockPosts = [
  { id: '1', userId: '1', title: 'First Post', content: 'This is the first post' },
  { id: '2', userId: '1', title: 'Second Post', content: 'This is the second post' },
  { id: '3', userId: '2', title: 'Jane\'s Post', content: 'This is Jane\'s post' },
];

async function fetchUser(userId: string) {
  await delay(300);
  const user = mockUsers[userId];
  if (!user) throw new Error('User not found');
  return user;
}

async function fetchUserPosts(userId: string) {
  await delay(400);
  return mockPosts.filter(p => p.userId === userId);
}

export default function UserPosts() {
  const { userId } = useParams<{ userId: string }>();

  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId!),
  });

  const { data: posts, isLoading } = useQuery({
    queryKey: ['user', userId, 'posts'],
    queryFn: () => fetchUserPosts(userId!),
    enabled: !!userId,
  });

  return React.createElement(
    'div',
    null,
    React.createElement('h2', null, user ? `${user.name}'s Posts` : 'User Posts'),
    isLoading && React.createElement('p', null, 'Loading posts...'),
    posts && React.createElement(
      'ul',
      null,
      posts.map(post =>
        React.createElement(
          'li',
          { key: post.id, style: { marginBottom: '15px', padding: '10px', background: '#f9f9f9', borderRadius: '4px' } },
          React.createElement('h4', null, post.title),
          React.createElement('p', null, post.content)
        )
      )
    ),
    React.createElement('br', null),
    React.createElement('a', { href: '/users' }, 'Back to Users')
  );
}
