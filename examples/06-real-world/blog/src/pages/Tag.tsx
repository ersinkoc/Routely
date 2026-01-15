import React from 'react';
import { useParams } from '@oxog/routely-core';
import { posts as allPosts } from '../main';

export default function Tag() {
  const { tag } = useParams<{ tag: string }>();
  const decodedTag = decodeURIComponent(tag!);
  const tagPosts = allPosts.filter(p => p.tags.includes(decodedTag));

  return React.createElement(
    'div',
    null,
    React.createElement('a', { href: '/', style: { color: '#3b82f6', textDecoration: 'none', marginBottom: '20px', display: 'inline-block' } }, '← Back to Home'),
    React.createElement('h1', { style: { fontSize: '36px', marginBottom: '10px' } }, `#${decodedTag}`),
    React.createElement('p', { style: { color: '#64748b', marginBottom: '30px' } }, `${tagPosts.length} posts`),
    React.createElement(
      'div',
      { style: { display: 'grid', gap: '20px' } },
      tagPosts.map(post =>
        React.createElement(
          'a',
          { key: post.id, href: `/post/${post.slug}`, style: { textDecoration: 'none', color: 'inherit' } },
          React.createElement(
            'article',
            {
              style: {
                background: 'white',
                padding: '25px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }
            },
            React.createElement('h2', { style: { margin: '0 0 10px', color: '#1e293b' } }, post.title),
            React.createElement('p', { style: { color: '#64748b', marginBottom: '15px' } }, post.excerpt),
            React.createElement('div', { style: { fontSize: '13px', color: '#94a3b8' } },
              `${post.author} · ${new Date(post.date).toLocaleDateString()} · ${post.readTime} min read`
            )
          )
        )
      )
    )
  );
}
