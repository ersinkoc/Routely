import React from 'react';
import { motion } from 'framer-motion';

export default function SlidePage() {
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
