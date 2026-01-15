import React from 'react';
import { motion } from 'framer-motion';

export default function FlipPage() {
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
