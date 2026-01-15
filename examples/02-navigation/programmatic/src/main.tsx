import React from 'react';
import ReactDOM from 'react-dom/client';
import { createRouter, route } from '@oxog/routely-core';
import { RouterProvider, Outlet } from '@oxog/routely-react';

// Define routes
const routes = [
  route('/', () => import('./pages/Home')),
  route('/page1', () => import('./pages/Page1')),
  route('/page2', () => import('./pages/Page2')),
  route('/page3', () => import('./pages/Page3')),
];

// Create router
const router = createRouter({
  routes,
});

// Root layout component
function Layout() {
  return (
    <div>
      <h1>Programmatic Navigation Example</h1>
      <p>This example demonstrates the useNavigate() hook for programmatic navigation.</p>
      <Outlet />
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
