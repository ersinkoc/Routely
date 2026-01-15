import React from 'react';

export default function IndexPage() {
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
// userRoutes.show = '/api/users/:id'`
      )
    ),
    React.createElement(
      'div',
      { style: { marginBottom: '20px', padding: '15px', background: '#fff3e0', borderRadius: '4px' } },
      React.createElement('h3', null, 'Generic Parameter Extractor'),
      React.createElement('pre', { style: { background: '#fff', padding: '10px' } },
`type ParamsOf<T extends string> = 
  T extends \`\${string}:\${infer Param}/\${infer Rest}\`
    ? { [K in Param | keyof ParamsOf<\`/\${Rest}\`>]: string }
    : T extends \`\${string}:\${infer Param}\`
    ? { [K in Param]: string }
    : {};

type UserParams = ParamsOf<'/users/:userId'>;
// Result: { userId: string }`
      )
    ),
    React.createElement('h3', null, 'Try the routes:'),
    React.createElement(
      'ul',
      null,
      React.createElement('li', null, React.createElement('a', { href: '/users' }, 'Users')),
      React.createElement('li', null, React.createElement('a', { href: '/users/123' }, 'User 123')),
      React.createElement('li', null, React.createElement('a', { href: '/users/456/posts' }, 'User 456 Posts')),
      React.createElement('li', null, React.createElement('a', { href: '/products' }, 'Products')),
      React.createElement('li', null, React.createElement('a', { href: '/products/789' }, 'Product 789'))
    )
  );
}
