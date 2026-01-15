import React from 'react';
import { motion } from 'framer-motion';

const galleryImages = [
  { id: 1, color: '#FF6B6B' },
  { id: 2, color: '#4ECDC4' },
  { id: 3, color: '#45B7D1' },
  { id: 4, color: '#FFA07A' },
  { id: 5, color: '#98D8C8' },
  { id: 6, color: '#F7DC6F' },
];

export default function GalleryPage() {
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
