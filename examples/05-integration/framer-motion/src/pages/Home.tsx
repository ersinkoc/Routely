import React from 'react';
import { motion } from 'framer-motion';

export default function Home() {
  const pages = [
    { path: '/fade', name: 'Fade Transition', type: 'fade' as const },
    { path: '/slide', name: 'Slide Transition', type: 'slide' as const },
    { path: '/scale', name: 'Scale Transition', type: 'scale' as const },
    { path: '/flip', name: 'Flip Transition', type: 'flip' as const },
    { path: '/gallery', name: 'Image Gallery', type: 'fade' as const },
    { path: '/cards', name: 'Card Stack', type: 'scale' as const },
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
