# Minimal Example

The simplest possible Routely setup.

## Code

```tsx
import { createRouter, route, RouterProvider, Link, Outlet } from '@oxog/routely';

// Define routes
const router = createRouter({
  routes: [
    route('/', Home),
    route('/about', About),
  ],
});

// Components
function Home() {
  return <h1>Home Page</h1>;
}

function About() {
  return <h1>About Page</h1>;
}

// App
function App() {
  return (
    <RouterProvider router={router}>
      <nav>
        <Link to="/">Home</Link> | <Link to="/about">About</Link>
      </nav>
      <main>
        <Outlet />
      </main>
    </RouterProvider>
  );
}
```

## Features

- Basic routing
- Two routes
- Link components
- Outlet rendering

## Size

< 3KB gzipped total
