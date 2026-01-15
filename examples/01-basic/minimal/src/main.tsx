import React from 'react';
import ReactDOM from 'react-dom/client';
import { createRouter, route } from '@oxog/routely-core';
import { RouterProvider, Outlet } from '@oxog/routely-react';

// Define routes
const routes = [
  route('/', () => import('./pages/Home')),
  route('/about', () => import('./pages/About')),
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
