/**
 * Dashboard Application
 * 
 * A complete dashboard application featuring:
 * - Authentication with protected routes
 * - Lazy-loaded modules for code splitting
 * - Multiple nested routes (Dashboard, Users, Settings, Analytics)
 * - Role-based access control
 * - Real-time data updates
 */

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { createRouter, route, Outlet, useNavigate, useLocation } from '@oxog/routely-core';
import { lazyPluginCore } from '@oxog/routely-plugin-lazy';
import { guardsPlugin } from '@oxog/routely-plugin-guards';

// ============================================
// TYPES
// ============================================

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
}

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  revenue: number;
  orders: number;
}

// ============================================
// AUTH STATE (Mock)
// ============================================

const mockUsers: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@dashboard.com', role: 'admin' },
  { id: '2', name: 'Regular User', email: 'user@dashboard.com', role: 'user' },
  { id: '3', name: 'Viewer User', email: 'viewer@dashboard.com', role: 'viewer' },
];

let currentUser: User | null = null;
let isAuthenticated = false;

// ============================================
// AUTH GUARD
// ============================================

const authGuard = {
  pattern: '/dashboard',
  beforeEnter: () => {
    if (!isAuthenticated) {
      return { redirect: '/login' };
    }
    return null;
  },
};

const adminGuard = {
  pattern: '/dashboard/admin',
  beforeEnter: () => {
    if (!isAuthenticated || currentUser?.role !== 'admin') {
      return { redirect: '/dashboard' };
    }
    return null;
  },
};

// ============================================
// MOCK DATA
// ============================================

const mockStats: DashboardStats = {
  totalUsers: 1250,
  activeUsers: 342,
  revenue: 45230,
  orders: 156,
};

const mockActivities = [
  { id: 1, user: 'John Doe', action: 'Created new project', time: '2 min ago' },
  { id: 2, user: 'Jane Smith', action: 'Updated profile', time: '5 min ago' },
  { id: 3, user: 'Bob Johnson', action: 'Deleted account', time: '10 min ago' },
  { id: 4, user: 'Alice Brown', action: 'Purchased subscription', time: '15 min ago' },
  { id: 5, user: 'Charlie Wilson', action: 'Changed password', time: '20 min ago' },
];

// ============================================
// COMPONENTS
// ============================================

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    isAuthenticated = false;
    currentUser = null;
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname?.startsWith(path) ? 'active' : '';
  };

  return React.createElement(
    'div',
    { style: { display: 'flex', minHeight: '100vh', fontFamily: 'Arial, sans-serif' } },
    // Sidebar
    React.createElement(
      'aside',
      {
        style: {
          width: '250px',
          background: '#1e293b',
          color: 'white',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column'
        }
      },
      React.createElement('h2', { style: { marginBottom: '30px', fontSize: '24px' } }, 'Dashboard'),
      React.createElement(
        'nav',
        { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
        React.createElement(
          'a',
          {
            href: '/dashboard',
            className: isActive('/dashboard') && !location.pathname?.includes('/dashboard/') ? 'active' : '',
            style: {
              padding: '10px 15px',
              borderRadius: '6px',
              textDecoration: 'none',
              color: 'white',
              background: isActive('/dashboard') && !location.pathname?.includes('/dashboard/') ? '#3b82f6' : 'transparent',
            }
          },
          'Overview'
        ),
        React.createElement(
          'a',
          {
            href: '/dashboard/users',
            style: {
              padding: '10px 15px',
              borderRadius: '6px',
              textDecoration: 'none',
              color: 'white',
              background: isActive('/dashboard/users') ? '#3b82f6' : 'transparent',
            }
          },
          'Users'
        ),
        React.createElement(
          'a',
          {
            href: '/dashboard/analytics',
            style: {
              padding: '10px 15px',
              borderRadius: '6px',
              textDecoration: 'none',
              color: 'white',
              background: isActive('/dashboard/analytics') ? '#3b82f6' : 'transparent',
            }
          },
          'Analytics'
        ),
        React.createElement(
          'a',
          {
            href: '/dashboard/settings',
            style: {
              padding: '10px 15px',
              borderRadius: '6px',
              textDecoration: 'none',
              color: 'white',
              background: isActive('/dashboard/settings') ? '#3b82f6' : 'transparent',
            }
          },
          'Settings'
        ),
        currentUser?.role === 'admin' && React.createElement(
          'a',
          {
            href: '/dashboard/admin',
            style: {
              padding: '10px 15px',
              borderRadius: '6px',
              textDecoration: 'none',
              color: 'white',
              background: isActive('/dashboard/admin') ? '#3b82f6' : 'transparent',
            }
          },
          'Admin'
        )
      ),
      React.createElement('div', { style: { marginTop: 'auto' } },
        currentUser && React.createElement('p', { style: { fontSize: '14px', marginBottom: '10px' } }, `Logged in as ${currentUser.name}`),
        React.createElement(
          'button',
          {
            onClick: handleLogout,
            style: {
              width: '100%',
              padding: '10px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }
          },
          'Logout'
        )
      )
    ),
    // Main content
    React.createElement(
      'main',
      { style: { flex: 1, padding: '30px', background: '#f1f5f9' } },
      React.createElement(Outlet)
    )
  );
}

// ============================================
// ROUTES
// ============================================

const routes = [
  route('/', () => import('./pages/Landing')),
  route('/login', () => import('./pages/Login')),
  route('/dashboard', () => import('./pages/Dashboard'), [
    route('/dashboard/users', () => import('./pages/Users')),
    route('/dashboard/users/:userId', () => import('./pages/UserDetail')),
    route('/dashboard/analytics', () => import('./pages/Analytics')),
    route('/dashboard/settings', () => import('./pages/Settings')),
    route('/dashboard/admin', () => import('./pages/Admin')),
  ]),
];

// Create router
const router = createRouter({ routes });

// Install plugins
router.use(lazyPluginCore({ timeout: 5000 }));
router.use(guardsPlugin({ guards: [authGuard, adminGuard] }));

// Mount app
ReactDOM.createRoot(document.getElementById('root')!).render(
  React.createElement(Layout, null, React.createElement(router.RouterProvider, { router }))
);

// Export for use in pages
export { mockUsers, mockStats, mockActivities };
export { isAuthenticated, currentUser };
