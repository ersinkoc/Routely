import React from 'react';
import { mockActivities } from '../main';

export default function Analytics() {
  return React.createElement(
    'div',
    null,
    React.createElement('h2', { style: { marginBottom: '20px' } }, 'Analytics'),
    // Chart placeholder
    React.createElement(
      'div',
      {
        style: {
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }
      },
      React.createElement('h3', { style: { marginBottom: '15px' } }, 'Traffic Overview'),
      React.createElement(
        'div',
        {
          style: {
            height: '200px',
            display: 'flex',
            alignItems: 'flex-end',
            gap: '10px',
            padding: '20px 0',
            borderBottom: '1px solid #e2e8f0'
          }
        },
        [65, 80, 45, 90, 75, 60, 85, 70, 95, 80, 55, 90].map((value, index) =>
          React.createElement(
            'div',
            {
              key: index,
              style: {
                flex: 1,
                background: '#3b82f6',
                borderRadius: '4px 4px 0 0',
                height: `${value}%`,
                position: 'relative'
              }
            },
            React.createElement('span', {
              style: {
                position: 'absolute',
                bottom: '-25px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '12px',
                color: '#666'
              }
            }, index + 1)
          )
        )
      )
    ),
    // Recent Activity
    React.createElement(
      'div',
      {
        style: {
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }
      },
      React.createElement('h3', { style: { marginBottom: '15px' } }, 'Recent Activity'),
      React.createElement(
        'ul',
        { style: { listStyle: 'none', padding: 0 } },
        mockActivities.map(activity =>
          React.createElement(
            'li',
            {
              key: activity.id,
              style: {
                padding: '12px 0',
                borderBottom: '1px solid #f1f5f9'
              }
            },
            React.createElement(
              'div',
              { style: { display: 'flex', justifyContent: 'space-between' } },
              React.createElement('span', null, React.createElement('strong', null, activity.user), ' ', activity.action),
              React.createElement('span', { style: { fontSize: '14px', color: '#666' } }, activity.time)
            )
          )
        )
      )
    )
  );
}
