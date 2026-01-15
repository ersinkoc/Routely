import React from 'react';
import ReactDOM from 'react-dom/client';
import { createRouter, route } from '@oxog/routely-core';
import { RouterProvider, Outlet } from '@oxog/routely-react';

// Define nested routes
const routes = [
  route('/', () => import('./pages/Home'), {
    children: [
      route('dashboard', () => import('./pages/Dashboard'), {
        children: [
          route('overview', () => import('./pages/dashboard/Overview')),
          route('analytics', () => import('./pages/dashboard/Analytics')),
        ],
      }),
      route('settings', () => import('./pages/Settings'), {
        children: [
          route('profile', () => import('./pages/settings/Profile')),
          route('account', () => import('./pages/settings/Account')),
        ],
      }),
    ],
  }),
];

// Create router
const router = createRouter({
  routes,
});

// Root layout component
function Layout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav style={{ width: '200px', padding: '20px', background: '#f5f5f5' }}>
        <h3>Nested Routes</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li><a href="/dashboard">Dashboard</a></li>
          <li>
            <ul style={{ paddingLeft: '20px' }}>
              <li><a href="/dashboard/overview">Overview</a></li>
              <li><a href="/dashboard/analytics">Analytics</a></li>
            </ul>
          </li>
          <li><a href="/settings">Settings</a></li>
          <li>
            <ul style={{ paddingLeft: '20px' }}>
              <li><a href="/settings/profile">Profile</a></li>
              <li><a href="/settings/account">Account</a></li>
            </ul>
          </li>
        </ul>
      </nav>
      <main style={{ flex: 1, padding: '20px' }}>
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
