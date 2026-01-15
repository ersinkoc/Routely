import React from 'react';
import { useSearch } from '@oxog/routely-plugin-search';
import { posts as allPosts } from '../main';

interface SearchParams {
  q?: string;
}

export default function Search() {
  const { search } = useSearch<SearchParams>();
  const query = search.q || '';

  const results = query
    ? allPosts.filter(post =>
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(query.toLowerCase()) ||
        post.content.toLowerCase().includes(query.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  return React.createElement(
    'div',
    null,
    React.createElement('h1', { style: { fontSize: '36px', marginBottom: '10px' } }, 'Search'),
    React.createElement('p', { style: { color: '#64748b', marginBottom: '30px' } },
      query
        ? `Found ${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`
        : 'Enter a search query to find posts'
    ),
    query && results.length === 0 && React.createElement(
      'div',
      {
        style: {
          background: 'white',
          padding: '40px',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#64748b'
        }
      },
      React.createElement('p', { style: { fontSize: '18px' } }, 'No posts found matching your search.'),
      React.createElement('a', {
        href: '/',
        style: { color: '#3b82f6', textDecoration: 'none' }
      }, '← Back to Home')
    ),
    React.createElement(
      'div',
      { style: { display: 'grid', gap: '20px' } },
      results.map(post =>
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
              `${post.author} · ${post.category} · ${post.readTime} min read`
            )
          )
        )
      )
    )
  );
}
