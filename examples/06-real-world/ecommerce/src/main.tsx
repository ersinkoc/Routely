/**
 * E-commerce Application
 * 
 * A complete e-commerce application featuring:
 * - Product catalog with categories
 * - Product detail pages
 * - Shopping cart functionality
 * - Search and filter capabilities
 * - Checkout flow
 */

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { createRouter, route, Outlet, useNavigate, useLocation, useParams } from '@oxog/routely-core';
import { searchPlugin, useSearch } from '@oxog/routely-plugin-search';

// ============================================
// TYPES
// ============================================

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
}

interface CartItem extends Product {
  quantity: number;
}

// ============================================
// MOCK DATA
// ============================================

const products: Product[] = [
  { id: '1', name: 'Laptop', price: 999, category: 'electronics', description: 'High-performance laptop', image: '💻' },
  { id: '2', name: 'Mouse', price: 29, category: 'electronics', description: 'Wireless mouse', image: '🖱️' },
  { id: '3', name: 'Keyboard', price: 79, category: 'electronics', description: 'Mechanical keyboard', image: '⌨️' },
  { id: '4', name: 'Monitor', price: 299, category: 'electronics', description: '27-inch 4K display', image: '🖥️' },
  { id: '5', name: 'Headphones', price: 149, category: 'electronics', description: 'Noise-cancelling', image: '🎧' },
  { id: '6', name: 'Desk', price: 499, category: 'furniture', description: 'Standing desk', image: '🪑' },
  { id: '7', name: 'Chair', price: 299, category: 'furniture', description: 'Ergonomic chair', image: '💺' },
  { id: '8', name: 'Lamp', price: 49, category: 'furniture', description: 'LED desk lamp', image: '💡' },
  { id: '9', name: 'Book', price: 19, category: 'books', description: 'Bestseller novel', image: '📚' },
  { id: '10', name: 'Notebook', price: 9, category: 'books', description: 'Leather notebook', image: '📓' },
];

const categories = ['all', 'electronics', 'furniture', 'books'];

// ============================================
// CART STATE
// ============================================

let cartItems: CartItem[] = [];

export function addToCart(product: Product) {
  const existing = cartItems.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cartItems.push({ ...product, quantity: 1 });
  }
  window.dispatchEvent(new Event('cart-update'));
}

export function removeFromCart(productId: string) {
  cartItems = cartItems.filter(item => item.id !== productId);
  window.dispatchEvent(new Event('cart-update'));
}

export function updateQuantity(productId: string, quantity: number) {
  const item = cartItems.find(item => item.id === productId);
  if (item) {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      item.quantity = quantity;
    }
  }
  window.dispatchEvent(new Event('cart-update'));
}

export function getCartTotal() {
  return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
}

export function getCartItems() {
  return cartItems;
}

export function clearCart() {
  cartItems = [];
  window.dispatchEvent(new Event('cart-update'));
}

// ============================================
// COMPONENTS
// ============================================

function Navbar() {
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      setCartCount(cartItems.reduce((sum, item) => sum + item.quantity, 0));
    };

    updateCount();
    window.addEventListener('cart-update', updateCount);
    return () => window.removeEventListener('cart-update', updateCount);
  }, []);

  const isActive = (path: string) => location.pathname?.startsWith(path);

  return React.createElement(
    'nav',
    {
      style: {
        background: '#1e293b',
        color: 'white',
        padding: '15px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }
    },
    React.createElement(
      'div',
      { style: { display: 'flex', alignItems: 'center', gap: '30px' } },
      React.createElement('a', { href: '/', style: { fontSize: '24px', fontWeight: 'bold', textDecoration: 'none', color: 'white' } }, '🛍️ Shop'),
      React.createElement(
        'div',
        { style: { display: 'flex', gap: '20px' } },
        React.createElement('a', { href: '/', style: { textDecoration: 'none', color: isActive('/') && !isActive('/cart') ? '#60a5fa' : 'white' } }, 'Products'),
        React.createElement('a', { href: '/cart', style: { textDecoration: 'none', color: isActive('/cart') ? '#60a5fa' : 'white' } }, `Cart (${cartCount})`)
      )
    )
  );
}

// ============================================
// ROUTES
// ============================================

const routes = [
  route('/', () => import('./pages/Products')),
  route('/product/:productId', () => import('./pages/ProductDetail')),
  route('/cart', () => import('./pages/Cart')),
  route('/checkout', () => import('./pages/Checkout')),
  route('/success', () => import('./pages/Success')),
];

// Create router
const router = createRouter({ routes });
router.use(searchPlugin());

// Layout component
function Layout() {
  return React.createElement(
    'div',
    { style: { fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#f1f5f9' } },
    React.createElement(Navbar),
    React.createElement(
      'main',
      { style: { padding: '30px', maxWidth: '1200px', margin: '0 auto' } },
      React.createElement(Outlet)
    )
  );
}

// Mount app
ReactDOM.createRoot(document.getElementById('root')!).render(
  React.createElement(Layout, null, React.createElement(router.RouterProvider, { router }))
);

// Export for use in pages
export { products, categories };
