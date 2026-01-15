import { useParams } from '@oxog/routely-react';

// Define the expected params shape
interface UserParams {
  userId: string;
}

export default function UserDetail() {
  // Type-safe params access
  const { userId } = useParams<UserParams>();

  return (
    <div>
      <h2>User Detail</h2>
      <p><strong>User ID:</strong> {userId}</p>
      <p>This page demonstrates accessing a single dynamic route parameter.</p>

      <div style={{ marginTop: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '4px' }}>
        <h4>Code Example:</h4>
        <pre style={{ background: '#fff', padding: '10px' }}>
{`// Define route with parameter
route('/users/:userId', component)

// Access parameter in component
const { userId } = useParams<{ userId: string }>()`}
        </pre>
      </div>
    </div>
  );
}
