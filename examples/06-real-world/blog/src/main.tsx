/**
 * Blog Application
 * 
 * A complete blog application featuring:
 * - Post listing with pagination
 * - Post detail pages with markdown support
 * - Category filtering
 * - Tag-based navigation
 * - Author pages
 * - Code splitting with lazy loading
 */

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { createRouter, route, Outlet, useNavigate, useLocation, useParams } from '@oxog/routely-core';
import { lazyPluginCore } from '@oxog/routely-plugin-lazy';

// ============================================
// TYPES
// ============================================

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  tags: string[];
  readTime: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  count: number;
}

// ============================================
// MOCK DATA
// ============================================

const posts: Post[] = [
  {
    id: '1',
    title: 'Getting Started with React',
    slug: 'getting-started-with-react',
    excerpt: 'Learn the basics of React and start building modern web applications.',
    content: `# Getting Started with React

React is a JavaScript library for building user interfaces. In this post, we'll cover the basics.

## Installation

\`\`\`bash
npm create react-app my-app
\`\`\`

## Components

React components are the building blocks of React applications. They can be defined as functions:

\`\`\`jsx
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}
\`\`\`

## JSX

JSX is a syntax extension for JavaScript that looks similar to HTML. It's used with React to describe what the UI should look like.`,
    author: 'John Doe',
    date: '2024-01-15',
    category: 'react',
    tags: ['react', 'javascript', 'frontend'],
    readTime: 5
  },
  {
    id: '2',
    title: 'TypeScript Best Practices',
    slug: 'typescript-best-practices',
    excerpt: 'Discover the best practices for writing maintainable TypeScript code.',
    content: `# TypeScript Best Practices

TypeScript adds static typing to JavaScript, making your code more robust and maintainable.

## Type Definitions

Always define explicit types for your function parameters and return values:

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}
\`\`\`

## Interfaces vs Types

Use interfaces for object shapes that might be extended:

\`\`\`typescript
interface User {
  id: string;
  name: string;
  email?: string; // Optional
}
\`\`\``,
    author: 'Jane Smith',
    date: '2024-01-10',
    category: 'typescript',
    tags: ['typescript', 'javascript', 'programming'],
    readTime: 8
  },
  {
    id: '3',
    title: 'Building APIs with Node.js',
    slug: 'building-apis-with-nodejs',
    excerpt: 'A comprehensive guide to creating RESTful APIs with Node.js and Express.',
    content: `# Building APIs with Node.js

Node.js is a popular choice for building backend applications and APIs.

## Setting Up Express

\`\`\`javascript
const express = require('express');
const app = express();

app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});

app.listen(3000);
\`\`\`

## Middleware

Express middleware functions can be used to handle requests:

\`\`\`javascript
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
\`\`\``,
    author: 'Bob Johnson',
    date: '2024-01-05',
    category: 'backend',
    tags: ['nodejs', 'express', 'api'],
    readTime: 6
  },
  {
    id: '4',
    title: 'CSS Grid vs Flexbox',
    slug: 'css-grid-vs-flexbox',
    excerpt: 'Understanding when to use CSS Grid and when to use Flexbox.',
    content: `# CSS Grid vs Flexbox

Both CSS Grid and Flexbox are powerful layout systems, but they serve different purposes.

## Flexbox

Flexbox is one-dimensional and designed for laying out items in a single direction:

\`\`\`css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
}
\`\`\`

## Grid

CSS Grid is two-dimensional and designed for laying out items in rows and columns:

\`\`\`css
.container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
}
\`\`\``,
    author: 'Alice Brown',
    date: '2024-01-01',
    category: 'css',
    tags: ['css', 'layout', 'frontend'],
    readTime: 4
  },
  {
    id: '5',
    title: 'Introduction to GraphQL',
    slug: 'introduction-to-graphql',
    excerpt: 'Learn the fundamentals of GraphQL and how it compares to REST.',
    content: `# Introduction to GraphQL

GraphQL is a query language for APIs that gives clients the power to ask for exactly what they need.

## Queries

GraphQL queries allow clients to request specific data:

\`\`\`graphql
query {
  user(id: "1") {
    name
    email
    posts {
      title
    }
  }
}
\`\`\`

## Mutations

Mutations are used to modify data:

\`\`\`graphql
mutation {
  createUser(name: "John", email: "john@example.com") {
    id
    name
  }
}
\`\`\``,
    author: 'John Doe',
    date: '2023-12-20',
    category: 'backend',
    tags: ['graphql', 'api', 'backend'],
    readTime: 7
  },
  {
    id: '6',
    title: 'React Hooks Explained',
    slug: 'react-hooks-explained',
    excerpt: 'Deep dive into React Hooks and how to use them effectively.',
    content: `# React Hooks Explained

Hooks are functions that let you use state and other React features in functional components.

## useState

The useState hook adds state to functional components:

\`\`\`jsx
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
\`\`\`

## useEffect

The useEffect hook handles side effects:

\`\`\`jsx
useEffect(() => {
  document.title = \`Count: \${count}\`;
}, [count]);
\`\`\``,
    author: 'Jane Smith',
    date: '2023-12-15',
    category: 'react',
    tags: ['react', 'hooks', 'javascript'],
    readTime: 6
  }
];

const categories: Category[] = [
  { id: 'react', name: 'React', slug: 'react', count: 2 },
  { id: 'typescript', name: 'TypeScript', slug: 'typescript', count: 1 },
  { id: 'backend', name: 'Backend', slug: 'backend', count: 2 },
  { id: 'css', name: 'CSS', slug: 'css', count: 1 },
];

const allTags = Array.from(new Set(posts.flatMap(post => post.tags))).sort();

// ============================================
// COMPONENTS
// ============================================

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return React.createElement(
    'header',
    {
      style: {
        background: '#1e293b',
        color: 'white',
        padding: '20px 30px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }
    },
    React.createElement(
      'div',
      {
        style: {
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }
      },
      React.createElement('a', { href: '/', style: { fontSize: '24px', fontWeight: 'bold', textDecoration: 'none', color: 'white' } }, '📝 Blog'),
      React.createElement(
        'nav',
        { style: { display: 'flex', gap: '20px', alignItems: 'center' } },
        React.createElement('a', { href: '/', style: { textDecoration: 'none', color: 'white' } }, 'Home'),
        React.createElement('a', { href: '/categories', style: { textDecoration: 'none', color: 'white' } }, 'Categories'),
        React.createElement(
          'form',
          { onSubmit: handleSearch, style: { display: 'flex', gap: '10px' } },
          React.createElement('input', {
            type: 'text',
            value: searchQuery,
            onChange: e => setSearchQuery(e.target.value),
            placeholder: 'Search posts...',
            style: {
              padding: '8px 12px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '14px',
              width: '200px'
            }
          }),
          React.createElement('button', {
            type: 'submit',
            style: {
              padding: '8px 16px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }
          }, 'Search')
        )
      )
    )
  );
}

function Footer() {
  return React.createElement(
    'footer',
    {
      style: {
        background: '#1e293b',
        color: 'white',
        padding: '30px',
        textAlign: 'center',
        marginTop: '60px'
      }
    },
    React.createElement('p', { style: { margin: 0 } }, '© 2024 Blog - Built with Routely')
  );
}

// ============================================
// ROUTES
// ============================================

const routes = [
  route('/', () => import('./pages/Home')),
  route('/post/:slug', () => import('./pages/PostDetail')),
  route('/category/:slug', () => import('./pages/Category')),
  route('/tag/:tag', () => import('./pages/Tag')),
  route('/categories', () => import('./pages/Categories')),
  route('/author/:author', () => import('./pages/Author')),
  route('/search', () => import('./pages/Search')),
];

// Create router
const router = createRouter({ routes });
router.use(lazyPluginCore({ timeout: 3000 }));

// Layout component
function Layout() {
  return React.createElement(
    'div',
    { style: { fontFamily: 'Arial, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' } },
    React.createElement(Header),
    React.createElement(
      'main',
      { style: { flex: 1, padding: '30px', maxWidth: '1200px', margin: '0 auto', width: '100%' } },
      React.createElement(Outlet)
    ),
    React.createElement(Footer)
  );
}

// Mount app
ReactDOM.createRoot(document.getElementById('root')!).render(
  React.createElement(Layout, null, React.createElement(router.RouterProvider, { router }))
);

// Export for use in pages
export { posts, categories, allTags };
