export default function Admin() {
  return (
    <div>
      <h2>Admin Panel</h2>
      <p>Welcome to the admin area! 🔐</p>
      <p>This route is protected and requires admin role.</p>

      <div style={{ marginTop: '20px', padding: '15px', background: '#fff3e0', borderRadius: '4px' }}>
        <h4>Admin-Only Route</h4>
        <p>This route is protected by both authentication and role-based guards. Only users with admin role can access it.</p>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Admin Functions</h3>
        <ul>
          <li><a href="#">Manage Users</a></li>
          <li><a href="#">System Settings</a></li>
          <li><a href="#">Audit Logs</a></li>
          <li><a href="#">Security Reports</a></li>
        </ul>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>User Management</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>User</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Role</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '10px' }}>john@example.com</td>
              <td style={{ padding: '10px' }}>Admin</td>
              <td style={{ padding: '10px' }}>Active</td>
              <td style={{ padding: '10px' }}>
                <button>Edit</button>
              </td>
            </tr>
            <tr>
              <td style={{ padding: '10px' }}>jane@example.com</td>
              <td style={{ padding: '10px' }}>User</td>
              <td style={{ padding: '10px' }}>Active</td>
              <td style={{ padding: '10px' }}>
                <button>Edit</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
