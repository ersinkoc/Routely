import React from 'react';
import { motion } from 'framer-motion';

export default function ScalePage() {
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
