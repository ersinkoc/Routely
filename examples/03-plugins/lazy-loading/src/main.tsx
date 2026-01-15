import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { createRouter, route } from '@oxog/routely-core';
import { RouterProvider, lazyPlugin } from '@oxog/routely-react';
import { lazyPlugin as lazyPluginCore } from '@oxog/routely-plugin-lazy';

// Define routes with lazy loading
const routes = [
  route('/', () => import('./pages/Home')),
  route('/dashboard', () => import('./pages/Dashboard')),
  route('/analytics', () => import('./pages/Analytics')),
  route('/settings', () => import('./pages/Settings')),
  route('/reports', () => import('./pages/Reports')),
];

// Create router with lazy plugin
const router = createRouter({
  routes,
});
router.use(lazyPluginCore({ timeout: 3000 }));

// Loading component
function Loading() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div>
        <h2>Loading...</h2>
        <p>Please wait while the page loads.</p>
      </div>
    </div>
  );
}

// Root layout component
function Layout() {
  return (
    <div>
      <h1>Lazy Loading Example</h1>
      <p>This example demonstrates code splitting with the lazy plugin.</p>
      <nav>
        <a href="/">Home</a>
        <a href="/dashboard">Dashboard</a>
        <a href="/analytics">Analytics</a>
        <a href="/settings">Settings</a>
        <a href="/reports">Reports</a>
      </nav>
      <Suspense fallback={<Loading />}>
        <React.Suspense fallback={<Loading />}>
          <React.Suspense fallback={<Loading />}>
            <div id="outlet"></div>
          </React.Suspense>
        </React.Suspense>
      </Suspense>
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
