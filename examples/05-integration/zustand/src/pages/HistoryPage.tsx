import React from 'react';
import { useNavigate } from '@oxog/routely-core';
import { useNavigationStore } from '../main';

export default function HistoryPage() {
  const { history, goBack, clearHistory } = useNavigationStore();
  const navigate = useNavigate();

  const handleGoBack = () => {
    const previousPath = goBack();
    if (previousPath) {
      navigate(previousPath);
    }
  };

  return React.createElement(
    'div',
    null,
    React.createElement('h2', null, 'Navigation History'),
    React.createElement(
      'p',
      null,
      'This page demonstrates tracking navigation history in a Zustand store.'
    ),
    React.createElement(
      'div',
      { style: { marginBottom: '20px' } },
      React.createElement(
        'button',
        {
          onClick: handleGoBack,
          disabled: history.length <= 1,
          style: { padding: '5px 15px', marginRight: '10px' }
        },
        'Go Back'
      ),
      React.createElement(
        'button',
        {
          onClick: clearHistory,
          style: { padding: '5px 15px' }
        },
        'Clear History'
      )
    ),
    React.createElement(
      'div',
      { style: { padding: '15px', background: '#f5f5f5', borderRadius: '4px' } },
      React.createElement('h3', null, 'History:'),
      history.length === 0
        ? React.createElement('p', null, 'No history yet')
        : React.createElement(
            'ol',
            null,
            history.map((path, index) =>
              React.createElement(
                'li',
                { key: index },
                path,
                index === history.length - 1 && ' (current)'
              )
            )
          )
    ),
    React.createElement('br', null),
    React.createElement('a', { href: '/' }, 'Back to Home')
  );
}
