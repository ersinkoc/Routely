import React from 'react';
import { useParams } from '@oxog/routely-core';
import { posts as allPosts } from '../main';

export default function Author() {
  const { author } = useParams<{ author: string }>();
  const decodedAuthor = decodeURIComponent(author!);
  const authorPosts = allPosts.filter(p => p.author === decodedAuthor);

  // Calculate total read time
  const totalReadTime = authorPosts.reduce((sum, post) => sum + post.readTime, 0);

  return React.createElement(
    'div',
    null,
    React.createElement('a', { href: '/', style: { color: '#3b82f6', textDecoration: 'none', marginBottom: '20px', display: 'inline-block' } }, '← Back to Home'),
    React.createElement(
      'div',
      {
        style: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '40px',
          borderRadius: '12px',
          marginBottom: '30px',
          textAlign: 'center'
        }
      },
      React.createElement('div', { style: { fontSize: '64px', marginBottom: '15px' } }, '👤'),
      React.createElement('h1', { style: { fontSize: '36px', margin: '0 0 10px' } }, decodedAuthor),
      React.createElement('p', { style: { margin: 0, opacity: 0.9 } }, `${authorPosts.length} posts · ${totalReadTime} min total read time`)
    ),
    React.createElement('h2', { style: { marginBottom: '20px' } }, 'Posts by this author'),
    React.createElement(
      'div',
      { style: { display: 'grid', gap: '20px' } },
      authorPosts.map(post =>
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
            React.createElement('h3', { style: { margin: '0 0 10px', color: '#1e293b' } }, post.title),
            React.createElement('p', { style: { color: '#64748b', marginBottom: '15px' } }, post.excerpt),
            React.createElement('div', { style: { fontSize: '13px', color: '#94a3b8' } },
              `${new Date(post.date).toLocaleDateString()} · ${post.readTime} min read`
            )
          )
        )
      )
    )
  );
}
