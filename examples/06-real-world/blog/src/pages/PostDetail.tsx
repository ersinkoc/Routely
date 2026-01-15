import React from 'react';
import { useParams } from '@oxog/routely-core';
import { posts as allPosts, allTags } from '../main';

export default function PostDetail() {
  const { slug } = useParams<{ slug: string }>();
  const post = allPosts.find(p => p.slug === slug);

  if (!post) {
    return React.createElement(
      'div',
      null,
      React.createElement('h1', null, 'Post Not Found'),
      React.createElement('a', { href: '/' }, '← Back to Home')
    );
  }

  // Get related posts (same category, excluding current post)
  const relatedPosts = allPosts
    .filter(p => p.category === post.category && p.id !== post.id)
    .slice(0, 3);

  // Format content for display (simple markdown-like rendering)
  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return React.createElement('h1', { key: index, style: { fontSize: '32px', margin: '20px 0' } }, line.slice(2));
      } else if (line.startsWith('## ')) {
        return React.createElement('h2', { key: index, style: { fontSize: '24px', margin: '15px 0' } }, line.slice(3));
      } else if (line.startsWith('```')) {
        return null; // Skip code block markers
      } else if (line.trim().startsWith('```')) {
        return null;
      } else {
        return React.createElement('p', { key: index, style: { lineHeight: '1.8', marginBottom: '15px' } }, line);
      }
    });
  };

  return React.createElement(
    'div',
    null,
    React.createElement('a', { href: '/', style: { color: '#3b82f6', textDecoration: 'none', marginBottom: '20px', display: 'inline-block' } }, '← Back to Home'),
    React.createElement('article', { style: { maxWidth: '800px', margin: '0 auto' } },
      // Post header
      React.createElement('div', { style: { marginBottom: '30px' } },
        React.createElement('span', {
          style: {
            fontSize: '12px',
            padding: '4px 10px',
            background: '#e0e7ff',
            borderRadius: '20px',
            color: '#4338ca',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            marginBottom: '15px',
            display: 'inline-block'
          }
        }, post.category),
        React.createElement('h1', { style: { fontSize: '42px', margin: '15px 0', lineHeight: '1.2' } }, post.title),
        React.createElement('div', { style: { display: 'flex', gap: '20px', fontSize: '14px', color: '#64748b' } },
          React.createElement('span', null, `By ${post.author}`),
          React.createElement('span', null, new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })),
          React.createElement('span', null, `${post.readTime} min read`)
        )
      ),
      // Post content
      React.createElement('div', {
        style: {
          background: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          lineHeight: '1.8',
          fontSize: '16px'
        }
      }, formatContent(post.content)),
      // Tags
      React.createElement('div', { style: { marginTop: '30px' } },
        React.createElement('strong', null, 'Tags: '),
        post.tags.map((tag, index) =>
          React.createElement(React.Fragment, { key: tag },
            React.createElement('a', {
              href: `/tag/${tag}`,
              style: {
                color: '#3b82f6',
                textDecoration: 'none',
                margin: '0 5px'
              }
            }, tag),
            index < post.tags.length - 1 && ', '
          )
        )
      )
    ),
    // Related posts
    relatedPosts.length > 0 && React.createElement(
      'div',
      { style: { maxWidth: '800px', margin: '40px auto 0' } },
      React.createElement('h2', { style: { marginBottom: '20px' } }, 'Related Posts'),
      React.createElement(
        'div',
        { style: { display: 'grid', gap: '20px' } },
        relatedPosts.map(p =>
          React.createElement(
            'a',
            { key: p.id, href: `/post/${p.slug}`, style: { textDecoration: 'none', color: 'inherit' } },
            React.createElement(
              'div',
              {
                style: {
                  background: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }
              },
              React.createElement('h3', { style: { margin: '0 0 10px', color: '#1e293b' } }, p.title),
              React.createElement('p', { style: { margin: 0, color: '#64748b', fontSize: '14px' } }, p.excerpt)
            )
          )
        )
      )
    )
  );
}
