import React from 'react';
import ReactDOM from 'react-dom/client';
import { createRouter, route, Outlet } from '@oxog/routely-core';
import { searchPlugin } from '@oxog/routely-plugin-search';
import Products from './pages/Products';
import Home from './pages/Home';

// Define routes with search plugin
const routes = [
  route('/', () => import('./pages/Home')),
  route('/products', () => import('./pages/Products')),
];

// Create router and install search plugin
const router = createRouter({ routes });
router.use(searchPlugin());

// Layout component
function Layout() {
  return React.createElement(
    'div',
    { style: { fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px' } },
    React.createElement(
      'header',
      null,
      React.createElement('h1', null, 'Routely - Search Parameters Example'),
      React.createElement(
        'nav',
        { style: { marginBottom: '20px' } },
        React.createElement('a', { href: '/', style: { marginRight: '15px' } }, 'Home'),
        React.createElement('a', { href: '/products' }, 'Products')
      )
    ),
    React.createElement('main', null, React.createElement(Outlet))
  );
}

// Mount app
ReactDOM.createRoot(document.getElementById('root')!).render(
  React.createElement(
    Layout,
    null,
    React.createElement(router.RouterProvider, { router })
  )
);
