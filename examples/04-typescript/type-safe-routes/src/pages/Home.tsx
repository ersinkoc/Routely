import React from 'react';

export default function Home() {
  return React.createElement(
    'div',
    null,
    React.createElement('h2', null, 'Type-Safe Routes'),
    React.createElement(
      'p',
      null,
      'Navigate to different routes using type-safe navigation.'
    ),
    React.createElement('div', { style: { marginBottom: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '4px' } },
      React.createElement('h3', null, 'Type-Safe Navigation Example'),
      React.createElement('pre', { style: { background: '#fff', padding: '10px' } },
`// Define route paths as a type
type RoutePath = '/' | '/about' | '/users/:userId';

// Define parameter types
interface RouteParams {
  '/': {};
  '/about': {};
  '/users/:userId': { userId: string };
}

// Type-safe navigation function
function navigateTo<Path extends keyof RouteParams>(
  navigate: (path: string) => void,
  path: Path,
  params?: RouteParams[Path]
): void {
  // TypeScript ensures correct params for each route
  let fullPath = path as string;
  for (const [key, value] of Object.entries(params || {})) {
    fullPath = fullPath.replace(\`:\${key}\`, value);
  }
  navigate(fullPath);
}

// Usage with full type safety:
navigateTo(navigate, '/users/:userId', { userId: '123' });
// Error: navigateTo(navigate, '/users/:userId', { wrong: 'param' });`
      )
    )
  );
}
