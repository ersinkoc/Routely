import React from 'react';
import ReactDOM from 'react-dom/client';
import { createRouter, route } from '@oxog/routely-core';
import { RouterProvider, Outlet } from '@oxog/routely-react';

// Define routes with dynamic parameters
const routes = [
  route('/', () => import('./pages/Home')),
  route('/users/:userId', () => import('./pages/UserDetail')),
  route('/posts/:postId/comments/:commentId', () => import('./pages/CommentDetail')),
];

// Create router
const router = createRouter({
  routes,
});

// Root layout component
function Layout() {
  return (
    <div>
      <h1>Dynamic Route Parameters Example</h1>
      <nav>
        <a href="/">Home</a>
        <a href="/users/1">User 1</a>
        <a href="/users/2">User 2</a>
        <a href="/posts/1/comments/5">Post Comment</a>
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
