export default function Dashboard() {
  return (
    <div>
      <h2>Dashboard</h2>
      <p>Welcome to your dashboard! 🎉</p>
      <p>You have successfully accessed this protected route.</p>

      <div style={{ marginTop: '20px', padding: '15px', background: '#e8f5e9', borderRadius: '4px' }}>
        <h4>Protected Route</h4>
        <p>This route is protected by an authentication guard. Unauthenticated users are automatically redirected to the login page.</p>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Quick Stats</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
          <div style={{ padding: '15px', background: '#f5f5f5', borderRadius: '4px' }}>
            <h4>Projects</h4>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>12</p>
          </div>
          <div style={{ padding: '15px', background: '#f5f5f5', borderRadius: '4px' }}>
            <h4>Tasks</h4>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>48</p>
          </div>
          <div style={{ padding: '15px', background: '#f5f5f5', borderRadius: '4px' }}>
            <h4>Messages</h4>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>7</p>
          </div>
        </div>
      </div>
    </div>
  );
}
