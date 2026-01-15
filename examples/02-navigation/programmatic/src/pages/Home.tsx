import { useNavigate } from '@oxog/routely-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div>
      <h2>Home</h2>
      <p>Click the buttons below to navigate programmatically:</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button onClick={() => navigate('/page1')}>Navigate to Page 1</button>
        <button onClick={() => navigate('/page2')}>Navigate to Page 2</button>
        <button onClick={() => navigate('/page3')}>Navigate to Page 3</button>

        <hr />

        <p>You can also go back or forward:</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
        <button onClick={() => navigate(1)}>Go Forward</button>
      </div>
    </div>
  );
}
