import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function CardsPage() {
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
