export default function Home() {
  return (
    <div>
      <h2>Home</h2>
      <p>Welcome to the authentication guards example!</p>

      <div style={{ marginTop: '20px' }}>
        <h3>How it works:</h3>
        <ol>
          <li>The <strong>Dashboard</strong> and <strong>Admin</strong> routes are protected</li>
          <li>Try navigating to them without logging in - you'll be redirected to Login</li>
          <li>After logging in, you can access the protected routes</li>
          <li>The guards check authentication before allowing navigation</li>
        </ol>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', background: '#e3f2fd', borderRadius: '4px' }}>
        <h4>Features:</h4>
        <ul>
          <li><strong>Route protection:</strong> Prevent unauthorized access</li>
          <li><strong>Redirects:</strong> Automatically redirect to login</li>
          <li><strong>Role-based access:</strong> Check user roles/permissions</li>
          <li><strong>Async guards:</strong> Support async authentication checks</li>
        </ul>
      </div>
    </div>
  );
}
