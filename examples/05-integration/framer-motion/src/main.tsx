/**
 * Framer Motion Integration Example
 * 
 * This example demonstrates how to integrate Routely with Framer Motion
 * for beautiful page transitions and animations.
 */

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { createRouter, route, Outlet, useLocation, useNavigate } from '@oxog/routely-core';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// TRANSITION VARIANTS
// ============================================

const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const slideVariants = {
  initial: { x: 300, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -300, opacity: 0 },
};

const scaleVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 },
};

const flipVariants = {
  initial: { rotateY: 90, opacity: 0 },
  animate: { rotateY: 0, opacity: 1 },
  exit: { rotateY: -90, opacity: 0 },
};

type TransitionType = 'fade' | 'slide' | 'scale' | 'flip';

const transitionVariants: Record<TransitionType, typeof fadeVariants> = {
  fade: fadeVariants,
  slide: slideVariants,
  scale: scaleVariants,
  flip: flipVariants,
};

// ============================================
// ANIMATED PAGE WRAPPER
// ============================================

function AnimatedPage({
  children,
  transitionType = 'fade',
}: {
  children: React.ReactNode;
  transitionType?: TransitionType;
}) {
  const variants = transitionVariants[transitionType];

  return React.createElement(
    motion.div,
    {
      initial: 'initial',
      animate: 'animate',
      exit: 'exit',
      variants: variants,
      transition: { duration: 0.3 },
      style: { position: 'relative' }
    },
    children
  );
}

// ============================================
// LOCATION TRACKER FOR ANIMATIONS
// ============================================

function useDirectionalNavigation() {
  const location = useLocation();
  const [direction, setDirection] = useState(0);
  const [previousPath, setPreviousPath] = useState(location.pathname);

  useEffect(() => {
    if (location.pathname !== previousPath) {
      // Simple heuristic: if path is "greater" alphabetically, we're going forward
      const newDirection = location.pathname > previousPath ? 1 : -1;
      setDirection(newDirection);
      setPreviousPath(location.pathname);
    }
  }, [location.pathname, previousPath]);

  return direction;
}

// ============================================
// PAGES
// ============================================

function Home() {
  const navigate = useNavigate();

  const pages = [
    { path: '/fade', name: 'Fade Transition', type: 'fade' as TransitionType },
    { path: '/slide', name: 'Slide Transition', type: 'slide' as TransitionType },
    { path: '/scale', name: 'Scale Transition', type: 'scale' as TransitionType },
    { path: '/flip', name: 'Flip Transition', type: 'flip' as TransitionType },
    { path: '/gallery', name: 'Image Gallery', type: 'fade' as TransitionType },
    { path: '/cards', name: 'Card Stack', type: 'scale' as TransitionType },
  ];

  return React.createElement(
    'div',
    null,
    React.createElement('h2', null, 'Framer Motion Integration'),
    React.createElement(
      'p',
      null,
      'This example shows how to integrate Routely with Framer Motion for beautiful page transitions.'
    ),
    React.createElement(
      'div',
      { style: { marginBottom: '20px', padding: '15px', background: '#e3f2fd', borderRadius: '4px' } },
      React.createElement('h3', null, 'Features:'),
      React.createElement('ul', null,
        React.createElement('li', null, 'Multiple transition types (fade, slide, scale, flip)'),
        React.createElement('li', null, 'Directional navigation animations'),
        React.createElement('li', null, 'AnimatePresence for smooth enter/exit'),
        React.createElement('li', null, 'Stagger children animations'),
        React.createElement('li', null, 'Gesture-based interactions')
      )
    ),
    React.createElement('h3', null, 'Explore Transitions:'),
    React.createElement(
      'div',
      { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' } },
      pages.map(page =>
        React.createElement(
          motion.a,
          {
            key: page.path,
            href: page.path,
            whileHover: { scale: 1.05 },
            whileTap: { scale: 0.95 },
            style: {
              display: 'block',
              padding: '15px',
              background: '#f5f5f5',
              borderRadius: '8px',
              textDecoration: 'none',
              color: '#333',
            }
          },
          React.createElement('strong', null, page.name)
        )
      )
    )
  );
}

function FadePage() {
  return React.createElement(
    'div',
    { style: { padding: '40px', textAlign: 'center' } },
    React.createElement('h1', null, 'Fade Transition'),
    React.createElement('p', null, 'This page uses a simple fade in/out animation.'),
    React.createElement(motion.div, {
      initial: { scale: 0 },
      animate: { scale: 1 },
      transition: { delay: 0.2, type: 'spring' },
      style: {
        width: '100px',
        height: '100px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '50%',
        margin: '40px auto'
      }
    }),
    React.createElement('a', { href: '/' }, 'Back to Home')
  );
}

function SlidePage() {
  return React.createElement(
    'div',
    { style: { padding: '40px', textAlign: 'center' } },
    React.createElement('h1', null, 'Slide Transition'),
    React.createElement('p', null, 'This page slides in from the right and exits to the left.'),
    React.createElement(
      motion.div,
      {
        initial: { x: -100 },
        animate: { x: 100 },
        transition: { duration: 2, repeat: Infinity, repeatType: 'reverse' },
        style: {
          width: '80px',
          height: '80px',
          background: '#4CAF50',
          borderRadius: '8px',
          margin: '40px auto'
        }
      }
    ),
    React.createElement('a', { href: '/' }, 'Back to Home')
  );
}

function ScalePage() {
  return React.createElement(
    'div',
    { style: { padding: '40px', textAlign: 'center' } },
    React.createElement('h1', null, 'Scale Transition'),
    React.createElement('p', null, 'This page scales up when entering and down when exiting.'),
    React.createElement(motion.div, {
      animate: { scale: [1, 1.2, 1] },
      transition: { duration: 2, repeat: Infinity },
      style: {
        width: '100px',
        height: '100px',
        background: '#FF5722',
        borderRadius: '8px',
        margin: '40px auto'
      }
    }),
    React.createElement('a', { href: '/' }, 'Back to Home')
  );
}

function FlipPage() {
  return React.createElement(
    'div',
    { style: { padding: '40px', textAlign: 'center' } },
    React.createElement('h1', null, 'Flip Transition'),
    React.createElement('p', null, 'This page flips in when entering and out when exiting.'),
    React.createElement(motion.div, {
      animate: { rotateY: 360 },
      transition: { duration: 2, repeat: Infinity },
      style: {
        width: '100px',
        height: '100px',
        background: '#9C27B0',
        borderRadius: '8px',
        margin: '40px auto'
      }
    }),
    React.createElement('a', { href: '/' }, 'Back to Home')
  );
}

const galleryImages = [
  { id: 1, color: '#FF6B6B' },
  { id: 2, color: '#4ECDC4' },
  { id: 3, color: '#45B7D1' },
  { id: 4, color: '#FFA07A' },
  { id: 5, color: '#98D8C8' },
  { id: 6, color: '#F7DC6F' },
];

function GalleryPage() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0 },
    show: { opacity: 1, scale: 1 }
  };

  return React.createElement(
    'div',
    { style: { padding: '40px' } },
    React.createElement('h1', null, 'Image Gallery'),
    React.createElement('p', null, 'Stagger animation with AnimatePresence.'),
    React.createElement(
      motion.div,
      {
        variants: container,
        initial: 'hidden',
        animate: 'show',
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '20px',
          marginTop: '30px'
        }
      },
      galleryImages.map(image =>
        React.createElement(
          motion.div,
          {
            key: image.id,
            variants: item,
            whileHover: { scale: 1.1 },
            whileTap: { scale: 0.9 },
            style: {
              aspectRatio: '1',
              background: image.color,
              borderRadius: '12px',
              cursor: 'pointer'
            }
          }
        )
      )
    ),
    React.createElement('br', null),
    React.createElement('a', { href: '/' }, 'Back to Home')
  );
}

function CardsPage() {
  const [cards, setCards] = useState([
    { id: 1, title: 'Card 1', description: 'First card content' },
    { id: 2, title: 'Card 2', description: 'Second card content' },
    { id: 3, title: 'Card 3', description: 'Third card content' },
  ]);

  return React.createElement(
    'div',
    { style: { padding: '40px' } },
    React.createElement('h1', null, 'Card Stack'),
    React.createElement('p', null, 'Drag to reorder cards with layout animations.'),
    React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '30px' } },
      cards.map((card, index) =>
        React.createElement(
          motion.div,
          {
            key: card.id,
            layout: true,
            initial: { opacity: 0, y: 50 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -50 },
            transition: { delay: index * 0.1 },
            whileHover: { scale: 1.02 },
            style: {
              padding: '20px',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              cursor: 'grab'
            }
          },
          React.createElement('h3', null, card.title),
          React.createElement('p', null, card.description)
        )
      )
    ),
    React.createElement('br', null),
    React.createElement('a', { href: '/' }, 'Back to Home')
  );
}

// ============================================
// ROUTE CONFIG
// ============================================

const routes = [
  route('/', () => import('./pages/Home')),
  route('/fade', () => import('./pages/FadePage')),
  route('/slide', () => import('./pages/SlidePage')),
  route('/scale', () => import('./pages/ScalePage')),
  route('/flip', () => import('./pages/FlipPage')),
  route('/gallery', () => import('./pages/GalleryPage')),
  route('/cards', () => import('./pages/CardsPage')),
];

// Create router
const router = createRouter({ routes });

// ============================================
// MAIN APP
// ============================================

function App() {
  const location = useLocation();
  const direction = useDirectionalNavigation();

  return React.createElement(
    'div',
    { style: { fontFamily: 'Arial, sans-serif', maxWidth: '900px', margin: '0 auto', padding: '20px' } },
    React.createElement(
      'header',
      null,
      React.createElement('h1', null, 'Routely + Framer Motion'),
      React.createElement(
        'nav',
        { style: { marginBottom: '20px' } },
        React.createElement('a', { href: '/', style: { marginRight: '15px' } }, 'Home'),
        React.createElement('a', { href: '/fade', style: { marginRight: '15px' } }, 'Fade'),
        React.createElement('a', { href: '/slide', style: { marginRight: '15px' } }, 'Slide'),
        React.createElement('a', { href: '/scale', style: { marginRight: '15px' } }, 'Scale'),
        React.createElement('a', { href: '/flip', style: { marginRight: '15px' } }, 'Flip'),
        React.createElement('a', { href: '/gallery', style: { marginRight: '15px' } }, 'Gallery'),
        React.createElement('a', { href: '/cards' }, 'Cards')
      )
    ),
    React.createElement(
      AnimatePresence,
      { mode: 'wait', initial: false },
      React.createElement(
        AnimatedPage,
        { 
          key: location.pathname,
          transitionType: (location.route?.meta?.transition as TransitionType) || 'fade'
        },
        React.createElement(Outlet)
      )
    )
  );
}

// Layout component
function Layout() {
  return React.createElement(
    'div',
    null,
    React.createElement(App, null),
    React.createElement(router.RouterProvider, { router })
  );
}

// Mount app
ReactDOM.createRoot(document.getElementById('root')!).render(
  React.createElement(Layout, null)
);
