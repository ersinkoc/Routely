export default function Settings() {
  return (
    <div>
      <h2>Settings</h2>
      <p>This page was loaded on-demand! ⚙️</p>

      <form style={{ marginTop: '20px', maxWidth: '400px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email Notifications</label>
          <input type="checkbox" defaultChecked />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Dark Mode</label>
          <input type="checkbox" />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Language</label>
          <select style={{ width: '100%', padding: '8px' }}>
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
          </select>
        </div>
        <button type="button">Save Settings</button>
      </form>
    </div>
  );
}
