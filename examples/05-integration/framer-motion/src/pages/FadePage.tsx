import React from 'react';
import { motion } from 'framer-motion';

export default function FadePage() {
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
