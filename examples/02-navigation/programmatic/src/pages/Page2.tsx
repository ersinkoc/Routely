import { useNavigate } from '@oxog/routely-react';

export default function Page2() {
  const navigate = useNavigate();

  return (
    <div>
      <h2>Page 2</h2>
      <p>This is Page 2.</p>
      <button onClick={() => navigate('/')}>Go Home</button>
    </div>
  );
}
