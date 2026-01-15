import React, { useState } from 'react';
import { useSearch } from '@oxog/routely-plugin-search';
import { posts as allPosts } from '../main';

interface HomeParams {
  page?: string;
}

export default function Home() {
  const { search, setSearch } = useSearch<HomeParams>();
  const currentPage = parseInt(search.page || '1');
  const postsPerPage = 6;

  // Sort posts by date (newest first)
  const sortedPosts = [...allPosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Pagination
  const totalPages = Math.ceil(sortedPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const currentPosts = sortedPosts.slice(startIndex, endIndex);

  const setPage = (page: number) => {
    setSearch({ ...search, page: String(page) });
  };

  return React.createElement(
    'div',
    null,
    React.createElement(
      'div',
      {
        style: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '60px 40px',
          borderRadius: '12px',
          marginBottom: '40px',
          textAlign: 'center'
        }
      },
      React.createElement('h1', { style: { fontSize: '48px', margin: '0 0 15px' } }, 'Welcome to Our Blog'),
      React.createElement('p', { style: { fontSize: '18px', margin: 0, opacity: 0.9 } }, 'Discover articles about programming, web development, and more')
    ),
    React.createElement('h2', { style: { marginBottom: '20px' } }, 'Latest Posts'),
    React.createElement(
      'div',
      { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px' } },
      currentPosts.map(post =>
        React.createElement(
          'article',
          {
            key: post.id,
            style: {
              background: 'white',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }
          },
          React.createElement(
            'a',
            { href: `/post/${post.slug}`, style: { textDecoration: 'none', color: 'inherit' } },
            React.createElement(
              'div',
              { style: {
                height: '200px',
                background: `linear-gradient(135deg, ${post.category === 'react' ? '#61dafb' : post.category === 'typescript' ? '#3178c6' : post.category === 'backend' ? '#68a063' : '#f7df1e'} 0%, ${post.category === 'react' ? '#21a1c4' : post.category === 'typescript' ? '#235a9e' : post.category === 'backend' ? '#4d7c48' : '#d6be00'} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '64px'
              } },
              '📄'
            ),
            React.createElement('div', { style: { padding: '25px' } },
              React.createElement('div', { style: { marginBottom: '15px' } },
                React.createElement('span', {
                  style: {
                    fontSize: '12px',
                    padding: '4px 10px',
                    background: '#e0e7ff',
                    borderRadius: '20px',
                    color: '#4338ca',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }
                }, post.category)
              ),
              React.createElement('h3', { style: { fontSize: '20px', margin: '0 0 10px', color: '#1e293b' } }, post.title),
              React.createElement('p', { style: { color: '#64748b', fontSize: '14px', marginBottom: '15px', lineHeight: '1.6' } }, post.excerpt),
              React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#94a3b8' } },
                React.createElement('span', null, `${post.author}`),
                React.createElement('span', null, `${post.readTime} min read`)
              )
            )
          )
        )
      )
    ),
    // Pagination
    totalPages > 1 && React.createElement(
      'div',
      { style: { display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '40px' } },
      currentPage > 1 && React.createElement(
        'button',
        {
          onClick: () => setPage(currentPage - 1),
          style: {
            padding: '10px 20px',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            cursor: 'pointer'
          }
        },
        'Previous'
      ),
      Array.from({ length: totalPages }, (_, i) => i + 1).map(page =>
        React.createElement(
          'button',
          {
            key: page,
            onClick: () => setPage(page),
            style: {
              padding: '10px 15px',
              background: page === currentPage ? '#3b82f6' : 'white',
              color: page === currentPage ? 'white' : '#1e293b',
              border: page === currentPage ? 'none' : '1px solid #e2e8f0',
              borderRadius: '6px',
              cursor: 'pointer'
            }
          },
          page
        )
      ),
      currentPage < totalPages && React.createElement(
        'button',
        {
          onClick: () => setPage(currentPage + 1),
          style: {
            padding: '10px 20px',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            cursor: 'pointer'
          }
        },
        'Next'
      )
    )
  );
}
