import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { createRouter, route } from '@oxog/routely-core';
import { RouterProvider, Outlet } from '@oxog/routely-react';
import { guardsPlugin } from '@oxog/routely-plugin-guards';

// Mock auth state
let isAuthenticated = false;

// Define routes with guards
const routes = [
  route('/', () => import('./pages/Home')),
  route('/login', () => import('./pages/Login')),
  route('/dashboard', () => import('./pages/Dashboard'), {
    meta: { protected: true },
  }),
  route('/admin', () => import('./pages/Admin'), {
    meta: { protected: true, roles: ['admin'] },
  }),
];

// Create router with guards plugin
const router = createRouter({
  routes,
});
router.use(
  guardsPlugin({
    guards: [
      {
        pattern: '/dashboard',
        beforeEnter: () => {
          if (!isAuthenticated) {
            return { redirect: '/login' };
          }
        },
      },
      {
        pattern: '/admin',
        beforeEnter: () => {
          if (!isAuthenticated) {
            return { redirect: '/login' };
          }
          // Check admin role (mock)
          return; // Would check user roles here
        },
      },
    ],
  })
);

// Root layout component
function Layout() {
  const [auth, setAuth] = useState(isAuthenticated);

  useEffect(() => {
    isAuthenticated = auth;
  }, [auth]);

  const login = () => setAuth(true);
  const logout = () => setAuth(false);

  return (
    <div>
      <h1>Authentication Guards Example</h1>
      <p>This example demonstrates protecting routes with navigation guards.</p>

      <nav style={{ marginBottom: '20px' }}>
        <a href="/">Home</a>
        <a href="/dashboard">Dashboard (Protected)</a>
        <a href="/admin">Admin (Protected)</a>
        {auth ? (
          <button onClick={logout}>Logout</button>
        ) : (
          <a href="/login">Login</a>
        )}
      </nav>

      <div style={{ padding: '10px', background: auth ? '#e8f5e9' : '#ffebee', marginBottom: '20px' }}>
        <strong>Auth State:</strong> {auth ? 'Authenticated' : 'Not Authenticated'}
        {!auth && <button onClick={login} style={{ marginLeft: '10px' }}>Login</button>}
      </div>

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
