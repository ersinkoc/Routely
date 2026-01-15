import React from 'react';
import ReactDOM from 'react-dom/client';
import { createRouter, route } from '@oxog/routely-core';
import { RouterProvider, Outlet } from '@oxog/routely-react';

// Define routes
const routes = [
  route('/', () => import('./pages/Home')),
  route('/products', () => import('./pages/Products')),
  route('/about', () => import('./pages/About')),
  route('/contact', () => import('./pages/Contact')),
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
        <NavLink href="/">Home</NavLink>
        <NavLink href="/products">Products</NavLink>
        <NavLink href="/about">About</NavLink>
        <NavLink href="/contact">Contact</NavLink>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

// Custom NavLink component with active styling
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      style={{
        margin: '0 10px',
        padding: '8px 16px',
        textDecoration: 'none',
        color: '#333',
      }}
    >
      {children}
    </a>
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
