/**
 * Generic Route Parameters Example
 * 
 * This example demonstrates how to use TypeScript generics to create
 * reusable, type-safe parameter handling patterns for your routes.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { createRouter, route, Outlet, useParams } from '@oxog/routely-core';

// Generic parameter extractor type
type ParamsOf<T extends string> = T extends `${string}:${infer Param}/${infer Rest}`
  ? { [K in Param | keyof ParamsOf<`/${Rest}`>]: string }
  : T extends `${string}:${infer Param}`
  ? { [K in Param]: string }
  : {};

// Generic route configuration type
type GenericRoute<TPath extends string, TMeta = unknown> = {
  path: TPath;
  params: ParamsOf<TPath>;
  meta?: TMeta;
};

// Generic typed useParams hook
function useTypedParams<T extends string>() {
  const params = useParams<Record<string, string>>();
  
  // Type assertion to ensure params match the expected type
  return params as unknown as ParamsOf<T>;
}

// Generic resource route builder
function buildResourceRoutes<TResource extends string>(
  resource: TResource,
  basePath: string
) {
  const singular = resource;
  const plural = `${singular}s`;
  
  return {
    // Index route: /users
    index: `${basePath}/${plural}` as const,
    // Show route: /users/:userId
    show: `${basePath}/${plural}/:id` as const,
    // Create route: /users/new
    create: `${basePath}/${plural}/new` as const,
    // Edit route: /users/:userId/edit
    edit: `${basePath}/${plural}/:id/edit` as const,
    // Nested routes
    nested: {
      // /users/:userId/posts
      posts: `${basePath}/${plural}/:id/posts` as const,
      // /users/:userId/settings
      settings: `${basePath}/${plural}/:id/settings` as const,
    },
  };
}

// Example: Define resource routes for "User" resource
const userRoutes = buildResourceRoutes('User', '/api');

// Type examples from the generated routes:
type UserIndexParams = ParamsOf<typeof userRoutes.index>; // {}
type UserShowParams = ParamsOf<typeof userRoutes.show>; // { id: string }
type UserEditParams = ParamsOf<typeof userRoutes.edit>; // { id: string }
type UserPostsParams = ParamsOf<typeof userRoutes.nested.posts>; // { id: string }

// Pages demonstrating generic parameter usage

function IndexPage() {
  return React.createElement(
    'div',
    null,
    React.createElement('h2', null, 'Generic Parameters Demo'),
    React.createElement(
      'p',
      null,
      'This example shows how to use TypeScript generics for type-safe route parameters.'
    ),
    React.createElement(
      'div',
      { style: { marginBottom: '20px', padding: '15px', background: '#e3f2fd', borderRadius: '4px' } },
      React.createElement('h3', null, 'Resource Route Builder'),
      React.createElement('pre', { style: { background: '#fff', padding: '10px' } },
`// Generic resource route builder
function buildResourceRoutes<TResource extends string>(
  resource: TResource,
  basePath: string
) {
  return {
    index: \`\${basePath}/\${resource}s\`,
    show: \`\${basePath}/\${resource}s/:id\`,
    create: \`\${basePath}/\${resource}s/new\`,
    edit: \`\${basePath}/\${resource}s/:id/edit\`,
  };
}

// Usage:
const userRoutes = buildResourceRoutes('User', '/api');
// userRoutes.show = '/api/users/:id'
// Type: UserShowParams = { id: string }`
      )
    ),
    React.createElement(
      'div',
      { style: { marginBottom: '20px', padding: '15px', background: '#fff3e0', borderRadius: '4px' } },
      React.createElement('h3', null, 'Generic Parameter Extractor'),
      React.createElement('pre', { style: { background: '#fff', padding: '10px' } },
`// Extract parameter types from route paths
type ParamsOf<T extends string> = 
  T extends \`\${string}:\${infer Param}/\${infer Rest}\`
    ? { [K in Param | keyof ParamsOf<\`/\${Rest}\`>]: string }
    : T extends \`\${string}:\${infer Param}\`
    ? { [K in Param]: string }
    : {};

// Examples:
type UserParams = ParamsOf<'/users/:userId'>;
// Result: { userId: string }

type PostParams = ParamsOf<'/users/:userId/posts/:postId'>;
// Result: { userId: string, postId: string }`
      )
    ),
    React.createElement(
      'div',
      { style: { marginBottom: '20px', padding: '15px', background: '#f3e5f5', borderRadius: '4px' } },
      React.createElement('h3', null, 'Typed useParams Hook'),
      React.createElement('pre', { style: { background: '#fff', padding: '10px' } },
`// Generic typed useParams hook
function useTypedParams<T extends string>() {
  const params = useParams<Record<string, string>>();
  return params as unknown as ParamsOf<T>;
}

// Usage with full type inference:
function UserDetail() {
  const params = useTypedParams<'/users/:userId'>();
  // params is typed as: { userId: string }
  console.log(params.userId);
}`
      )
    ),
    React.createElement('h3', null, 'Try the routes:'),
    React.createElement(
      'ul',
      null,
      React.createElement('li', null, React.createElement('a', { href: userRoutes.index }, 'User Index: ', userRoutes.index)),
      React.createElement('li', null, React.createElement('a', { href: '/users/123' }, 'User Show: /users/123')),
      React.createElement('li', null, React.createElement('a', { href: '/users/456/posts' }, 'User Posts: /users/456/posts')),
      React.createElement('li', null, React.createElement('a', { href: '/products' }, 'Products')),
      React.createElement('li', null, React.createElement('a', { href: '/products/789' }, 'Product Detail: /products/789'))
    )
  );
}

function UserShow() {
  // Type-safe params with generic
  const params = useTypedParams<'/users/:userId'>();
  
  return React.createElement(
    'div',
    null,
    React.createElement('h2', null, 'User Detail'),
    React.createElement('p', null, `User ID: ${params.userId}`),
    React.createElement('p', null, 'The params object is fully typed as: { userId: string }'),
    React.createElement('a', { href: '/users' }, 'Back to Users')
  );
}

function UserPosts() {
  // Multiple parameters with generic
  const params = useTypedParams<'/users/:userId/posts'>();
  
  return React.createElement(
    'div',
    null,
    React.createElement('h2', null, 'User Posts'),
    React.createElement('p', null, `Viewing posts for user: ${params.userId}`),
    React.createElement('a', { href: '/users' }, 'Back to Users')
  );
}

function ProductList() {
  return React.createElement(
    'div',
    null,
    React.createElement('h2', null, 'Products'),
    React.createElement('p', null, 'Product list with generic parameter handling.'),
    React.createElement(
      'ul',
      null,
      React.createElement('li', null, React.createElement('a', { href: '/products/1' }, 'Product 1')),
      React.createElement('li', null, React.createElement('a', { href: '/products/2' }, 'Product 2'))
    )
  );
}

function ProductDetail() {
  // Same generic pattern for different resources
  const params = useTypedParams<'/products/:productId'>();
  
  return React.createElement(
    'div',
    null,
    React.createElement('h2', null, 'Product Detail'),
    React.createElement('p', null, `Product ID: ${params.productId}`),
    React.createElement('a', { href: '/products' }, 'Back to Products')
  );
}

// Define routes
const routes = [
  route('/', () => import('./pages/IndexPage')),
  route('/users', () => import('./pages/UserList')),
  route('/users/:userId', () => import('./pages/UserShow')),
  route('/users/:userId/posts', () => import('./pages/UserPosts')),
  route('/products', () => import('./pages/ProductList')),
  route('/products/:productId', () => import('./pages/ProductDetail')),
];

// Create router
const router = createRouter({ routes });

// Layout component
function Layout() {
  return React.createElement(
    'div',
    { style: { fontFamily: 'Arial, sans-serif', maxWidth: '900px', margin: '0 auto', padding: '20px' } },
    React.createElement(
      'header',
      null,
      React.createElement('h1', null, 'Routely - Generic Parameters'),
      React.createElement('p', null, 'TypeScript generics for reusable, type-safe route parameters')
    ),
    React.createElement('main', null, React.createElement(Outlet))
  );
}

// Export useTypedParams for use in page components
export { useTypedParams };

// Mount app
ReactDOM.createRoot(document.getElementById('root')!).render(
  React.createElement(
    Layout,
    null,
    React.createElement(router.RouterProvider, { router })
  )
);
