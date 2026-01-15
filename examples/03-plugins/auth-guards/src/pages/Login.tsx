import { useNavigate } from '@oxog/routely-react';

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Simulate login
    (window as any).isAuthenticated = true;
    // Trigger re-render
    navigate('/dashboard');
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>Login</h2>
      <p>Please log in to access protected routes.</p>

      <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Username</label>
          <input type="text" defaultValue="demo" style={{ width: '100%', padding: '8px' }} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
          <input type="password" defaultValue="password" style={{ width: '100%', padding: '8px' }} />
        </div>
        <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer' }}>Login</button>
      </form>

      <p style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
        Demo credentials: username: <strong>demo</strong>, password: <strong>password</strong>
      </p>
    </div>
  );
}
