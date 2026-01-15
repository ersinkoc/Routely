import { useNavigate } from '@oxog/routely-react';

export default function Page3() {
  const navigate = useNavigate();

  return (
    <div>
      <h2>Page 3</h2>
      <p>This is Page 3.</p>
      <button onClick={() => navigate('/')}>Go Home</button>
    </div>
  );
}
