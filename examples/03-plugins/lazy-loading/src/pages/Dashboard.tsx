export default function Dashboard() {
  return (
    <div>
      <h2>Dashboard</h2>
      <p>This page was loaded on-demand! 🚀</p>
      <p>Notice how the initial load was faster - this code wasn't included in the main bundle.</p>

      <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
        <div style={{ padding: '15px', background: '#f5f5f5', borderRadius: '4px' }}>
          <h4>Total Users</h4>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0' }}>1,234</p>
        </div>
        <div style={{ padding: '15px', background: '#f5f5f5', borderRadius: '4px' }}>
          <h4>Active Sessions</h4>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0' }}>567</p>
        </div>
        <div style={{ padding: '15px', background: '#f5f5f5', borderRadius: '4px' }}>
          <h4>Revenue</h4>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '10px 0' }}>$12,345</p>
        </div>
      </div>
    </div>
  );
}
