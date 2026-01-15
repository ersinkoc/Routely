import React from 'react';
import { Outlet } from '@oxog/routely-core';
import { mockStats } from '../main';

export default function Dashboard() {
  return React.createElement(
    'div',
    null,
    React.createElement('h1', { style: { marginBottom: '20px' } }, 'Dashboard Overview'),
    // Stats Cards
    React.createElement(
      'div',
      { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' } },
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
        React.createElement('p', { style: { fontSize: '14px', color: '#666', marginBottom: '5px' } }, 'Total Users'),
        React.createElement('p', { style: { fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' } }, mockStats.totalUsers.toLocaleString())
      ),
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
        React.createElement('p', { style: { fontSize: '14px', color: '#666', marginBottom: '5px' } }, 'Active Users'),
        React.createElement('p', { style: { fontSize: '32px', fontWeight: 'bold', color: '#10b981' } }, mockStats.activeUsers.toLocaleString())
      ),
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
        React.createElement('p', { style: { fontSize: '14px', color: '#666', marginBottom: '5px' } }, 'Revenue'),
        React.createElement('p', { style: { fontSize: '32px', fontWeight: 'bold', color: '#8b5cf6' } }, `$${mockStats.revenue.toLocaleString()}`)
      ),
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
        React.createElement('p', { style: { fontSize: '14px', color: '#666', marginBottom: '5px' } }, 'Orders'),
        React.createElement('p', { style: { fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' } }, mockStats.orders.toLocaleString())
      )
    ),
    // Main content
    React.createElement(Outlet)
  );
}
