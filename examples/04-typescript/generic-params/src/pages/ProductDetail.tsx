import React from 'react';
import { useTypedParams } from '../main';

export default function ProductDetail() {
  const params = useTypedParams<'/products/:productId'>();
  
  return React.createElement(
    'div',
    null,
    React.createElement('h2', null, 'Product Detail'),
    React.createElement('div', { style: { padding: '15px', background: '#fff3e0', borderRadius: '4px', marginBottom: '20px' } },
      React.createElement('strong', null, 'Typed Parameters:'),
      React.createElement('br', null),
      React.createElement('code', null, `productId: "${params.productId}" (type: string)`)
    ),
    React.createElement('p', null, 'Same generic pattern works for different resources!'),
    React.createElement('p', null, `The params object is typed as: { productId: string }`),
    React.createElement('br', null),
    React.createElement('a', { href: '/products' }, 'Back to Products')
  );
}
