/**
 * Zustand Integration Example
 * 
 * This example demonstrates how to integrate Routely with Zustand
 * for global state management with route-specific state.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { createRouter, route, Outlet, useLocation, useNavigate } from '@oxog/routely-core';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// ============================================
// ZUSTAND STORES
// ============================================

// Auth store
interface AuthState {
  user: { id: string; name: string; email: string } | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
        login: async (email, password) => {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          set({
            user: { id: '1', name: 'John Doe', email },
            isAuthenticated: true,
          });
        },
        logout: () => set({ user: null, isAuthenticated: false }),
      }),
      { name: 'auth-storage' }
    )
  )
);

// Navigation history store
interface NavigationState {
  history: string[];
  currentPath: string;
  addHistory: (path: string) => void;
  goBack: () => string | null;
  clearHistory: () => void;
}

export const useNavigationStore = create<NavigationState>()(
  devtools(
    (set, get) => ({
      history: [],
      currentPath: '/',
      addHistory: (path) =>
        set((state) => ({
          history: [...state.history, path],
          currentPath: path,
        })),
      goBack: () => {
        const history = get().history;
        if (history.length > 1) {
          const newHistory = history.slice(0, -1);
          const previousPath = newHistory[newHistory.length - 1];
          set({ history: newHistory, currentPath: previousPath });
          return previousPath;
        }
        return null;
      },
      clearHistory: () => set({ history: [], currentPath: '/' }),
    }),
    { name: 'NavigationStore' }
  )
);

// Route-specific data store
interface RouteDataState {
  routeData: Record<string, unknown>;
  setRouteData: (path: string, data: unknown) => void;
  getRouteData: (path: string) => unknown;
  clearRouteData: (path: string) => void;
}

export const useRouteDataStore = create<RouteDataState>()(
  devtools(
    (set, get) => ({
      routeData: {},
      setRouteData: (path, data) =>
        set((state) => ({
          routeData: { ...state.routeData, [path]: data },
        })),
      getRouteData: (path) => {
        return get().routeData[path];
      },
      clearRouteData: (path) =>
        set((state) => {
          const newData = { ...state.routeData };
          delete newData[path];
          return { routeData: newData };
        }),
    }),
    { name: 'RouteDataStore' }
  )
);

// Cart store for e-commerce example
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  devtools(
    (set, get) => ({
      items: [],
      total: 0,
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
              total: state.total + item.price,
            };
          }
          return {
            items: [...state.items, { ...item, quantity: 1 }],
            total: state.total + item.price,
          };
        }),
      removeItem: (id) =>
        set((state) => {
          const item = state.items.find((i) => i.id === id);
          return {
            items: state.items.filter((i) => i.id !== id),
            total: state.total - (item?.price * item.quantity || 0),
          };
        }),
      updateQuantity: (id, quantity) =>
        set((state) => {
          const item = state.items.find((i) => i.id === id);
          if (!item) return state;
          const diff = (quantity - item.quantity) * item.price;
          return {
            items: state.items.map((i) =>
              i.id === id ? { ...i, quantity } : i
            ),
            total: state.total + diff,
          };
        }),
      clear: () => set({ items: [], total: 0 }),
    }),
    { name: 'CartStore' }
  )
);

// ============================================
// TRACK LOCATION IN ZUSTAND STORE
// ============================================

function LocationTracker() {
  const location = useLocation();
  const addHistory = useNavigationStore((state) => state.addHistory);

  React.useEffect(() => {
    if (location.pathname) {
      addHistory(location.pathname);
    }
  }, [location.pathname, addHistory]);

  return null;
}

// ============================================
// PAGES
// ============================================

function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { items } = useCartStore();
  const { currentPath, history } = useNavigationStore();

  return React.createElement(
    'div',
    null,
    React.createElement('h2', null, 'Zustand Integration'),
    React.createElement(
      'p',
      null,
      'This example demonstrates Routely integrated with Zustand for state management.'
    ),
    React.createElement(
      'div',
      { style: { marginBottom: '20px', padding: '15px', background: '#e3f2fd', borderRadius: '4px' } },
      React.createElement('h3', null, 'Global State:'),
      React.createElement('p', null, `Current Path: ${currentPath}`),
      React.createElement('p', null, `History Length: ${history.length}`),
      React.createElement('p', null, `Auth: ${isAuthenticated ? `Logged in as ${user?.name}` : 'Not logged in'}`),
      React.createElement('p', null, `Cart Items: ${items.length}`)
    ),
    React.createElement('h3', null, 'Examples:'),
    React.createElement(
      'ul',
      null,
      React.createElement('li', null, React.createElement('a', { href: '/auth' }, 'Authentication Flow')),
      React.createElement('li', null, React.createElement('a', { href: '/shop' }, 'Shopping Cart')),
      React.createElement('li', null, React.createElement('a', { href: '/history' }, 'Navigation History'))
    )
  );
}

function AuthPage() {
  const { isAuthenticated, user, login, logout } = useAuthStore();

  const [email, setEmail] = React.useState('john@example.com');
  const [password, setPassword] = React.useState('password');
  const [loading, setLoading] = React.useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login(email, password);
    } finally {
      setLoading(false);
    }
  };

  return React.createElement(
    'div',
    null,
    React.createElement('h2', null, 'Authentication'),
    React.createElement(
      'div',
      { style: { padding: '15px', background: '#f5f5f5', borderRadius: '4px', marginBottom: '20px' } },
      React.createElement('h3', null, 'Auth Store (with Persistence)'),
      React.createElement('p', null, 'This state is persisted in localStorage using zustand/persist middleware.'),
      React.createElement('p', null, `Status: ${isAuthenticated ? 'Authenticated' : 'Not authenticated'}`),
      isAuthenticated && user && React.createElement(
        'div',
        null,
        React.createElement('p', null, `User: ${user.name}`),
        React.createElement('p', null, `Email: ${user.email}`)
      )
    ),
    !isAuthenticated
      ? React.createElement(
          'div',
          { style: { padding: '15px', background: '#fff3e0', borderRadius: '4px' } },
          React.createElement('h3', null, 'Login'),
          React.createElement('div', { style: { marginBottom: '10px' } },
            React.createElement('label', null, 'Email:'),
            React.createElement('br', null),
            React.createElement('input', {
              type: 'email',
              value: email,
              onChange: e => setEmail(e.target.value),
              style: { padding: '5px', width: '300px' }
            })
          ),
          React.createElement('div', { style: { marginBottom: '10px' } },
            React.createElement('label', null, 'Password:'),
            React.createElement('br', null),
            React.createElement('input', {
              type: 'password',
              value: password,
              onChange: e => setPassword(e.target.value),
              style: { padding: '5px', width: '300px' }
            })
          ),
          React.createElement(
            'button',
            {
              onClick: handleLogin,
              disabled: loading,
              style: { padding: '5px 15px' }
            },
            loading ? 'Logging in...' : 'Login'
          )
        )
      : React.createElement(
          'div',
          { style: { padding: '15px', background: '#c8e6c9', borderRadius: '4px' } },
          React.createElement('p', null, 'You are logged in!'),
          React.createElement(
            'button',
            {
              onClick: logout,
              style: { padding: '5px 15px' }
            },
            'Logout'
          )
        ),
    React.createElement('br', null),
    React.createElement('a', { href: '/' }, 'Back to Home')
  );
}

function ShopPage() {
  const { items, total, addItem, removeItem, updateQuantity } = useCartStore();

  const products = [
    { id: '1', name: 'Laptop', price: 999 },
    { id: '2', name: 'Mouse', price: 29 },
    { id: '3', name: 'Keyboard', price: 79 },
    { id: '4', name: 'Monitor', price: 299 },
  ];

  return React.createElement(
    'div',
    null,
    React.createElement('h2', null, 'Shopping Cart'),
    React.createElement(
      'div',
      { style: { display: 'flex', gap: '20px' } },
      React.createElement(
        'div',
        { style: { flex: 1 } },
        React.createElement('h3', null, 'Products'),
        products.map(product =>
          React.createElement(
            'div',
            {
              key: product.id,
              style: {
                padding: '10px',
                marginBottom: '10px',
                background: '#f5f5f5',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }
            },
            React.createElement(
              'span',
              null,
              `${product.name} - $${product.price}`
            ),
            React.createElement(
              'button',
              {
                onClick: () => addItem(product),
                style: { padding: '5px 10px' }
              },
              'Add to Cart'
            )
          )
        )
      ),
      React.createElement(
        'div',
        { style: { flex: 1, padding: '15px', background: '#fff3e0', borderRadius: '4px' } },
        React.createElement('h3', null, 'Cart'),
        items.length === 0
          ? React.createElement('p', null, 'Your cart is empty')
          : React.createElement(
              React.Fragment,
              null,
              items.map(item =>
                React.createElement(
                  'div',
                  {
                    key: item.id,
                    style: {
                      padding: '10px',
                      marginBottom: '10px',
                      background: '#fff',
                      borderRadius: '4px'
                    }
                  },
                  React.createElement('div', null, item.name),
                  React.createElement('div', null, `$${item.price} each`),
                  React.createElement(
                    'div',
                    { style: display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' } },
                    React.createElement(
                      'button',
                      {
                        onClick: () => updateQuantity(item.id, Math.max(1, item.quantity - 1)),
                        style: { padding: '2px 8px' }
                      },
                      '-'
                    ),
                    React.createElement('span', null, item.quantity),
                    React.createElement(
                      'button',
                      {
                        onClick: () => updateQuantity(item.id, item.quantity + 1),
                        style: { padding: '2px 8px' }
                      },
                      '+'
                    ),
                    React.createElement(
                      'button',
                      {
                        onClick: () => removeItem(item.id),
                        style: { padding: '2px 8px', marginLeft: '10px', background: '#ef5350', color: 'white', border: 'none' }
                      },
                      '×'
                    )
                  ),
                  React.createElement('div', { style: marginTop: '5px', fontWeight: 'bold' }, `$${item.price * item.quantity}`)
                )
              ),
              React.createElement('hr', null),
              React.createElement(
                'div',
                { style: display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold' } },
                React.createElement('span', null, 'Total:'),
                React.createElement('span', null, `$${total}`)
              )
            )
      )
    ),
    React.createElement('br', null),
    React.createElement('a', { href: '/' }, 'Back to Home')
  );
}

function HistoryPage() {
  const { history, goBack, clearHistory } = useNavigationStore();
  const navigate = useNavigate();

  const handleGoBack = () => {
    const previousPath = goBack();
    if (previousPath) {
      navigate(previousPath);
    }
  };

  return React.createElement(
    'div',
    null,
    React.createElement('h2', null, 'Navigation History'),
    React.createElement(
      'p',
      null,
      'This page demonstrates tracking navigation history in a Zustand store.'
    ),
    React.createElement(
      'div',
      { style: { marginBottom: '20px' } },
      React.createElement(
        'button',
        {
          onClick: handleGoBack,
          disabled: history.length <= 1,
          style: { padding: '5px 15px', marginRight: '10px' }
        },
        'Go Back'
      ),
      React.createElement(
        'button',
        {
          onClick: clearHistory,
          style: { padding: '5px 15px' }
        },
        'Clear History'
      )
    ),
    React.createElement(
      'div',
      { style: { padding: '15px', background: '#f5f5f5', borderRadius: '4px' } },
      React.createElement('h3', null, 'History:'),
      history.length === 0
        ? React.createElement('p', null, 'No history yet')
        : React.createElement(
            'ol',
            null,
            history.map((path, index) =>
              React.createElement(
                'li',
                { key: index },
                path,
                index === history.length - 1 && ' (current)'
              )
            )
          )
    ),
    React.createElement('br', null),
    React.createElement('a', { href: '/' }, 'Back to Home')
  );
}

// ============================================
// ROUTES
// ============================================

const routes = [
  route('/', () => import('./pages/Home')),
  route('/auth', () => import('./pages/AuthPage')),
  route('/shop', () => import('./pages/ShopPage')),
  route('/history', () => import('./pages/HistoryPage')),
];

// Create router
const router = createRouter({ routes });

// Layout component
function Layout() {
  return React.createElement(
    'div',
    { style: { fontFamily: 'Arial, sans-serif', maxWidth: '900px', margin: '0 auto', padding: '20px' } },
    React.createElement(
      'header',
      null,
      React.createElement('h1', null, 'Routely + Zustand'),
      React.createElement(
        'nav',
        { style: { marginBottom: '20px' } },
        React.createElement('a', { href: '/', style: { marginRight: '15px' } }, 'Home'),
        React.createElement('a', { href: '/auth', style: { marginRight: '15px' } }, 'Auth'),
        React.createElement('a', { href: '/shop', style: { marginRight: '15px' } }, 'Shop'),
        React.createElement('a', { href: '/history' }, 'History')
      )
    ),
    React.createElement(LocationTracker),
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
