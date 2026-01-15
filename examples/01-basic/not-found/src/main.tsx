import React from 'react';
import ReactDOM from 'react-dom/client';
import { createRouter, route } from '@oxog/routely-core';
import { RouterProvider, Outlet } from '@oxog/routely-react';

// Define routes with a catch-all 404
const routes = [
  route('/', () => import('./pages/Home')),
  route('/about', () => import('./pages/About')),
  route('/contact', () => import('./pages/Contact')),
  route('*', () => import('./pages/NotFound')), // Catch-all route
];

// Create router
const router = createRouter({
  routes,
});

// Root layout component
function Layout() {
  return (
    <div>
      <nav>
        <a href="/">Home</a>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
        <a href="/invalid">Invalid Link (404)</a>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

// Render app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router}>
      <Layout />
    </RouterProvider>
  </React.StrictMode>
);
