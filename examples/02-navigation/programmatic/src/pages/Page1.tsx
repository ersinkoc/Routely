import { useNavigate } from '@oxog/routely-react';

export default function Page1() {
  const navigate = useNavigate();

  return (
    <div>
      <h2>Page 1</h2>
      <p>This is Page 1.</p>
      <button onClick={() => navigate('/')}>Go Home</button>
    </div>
  );
}
