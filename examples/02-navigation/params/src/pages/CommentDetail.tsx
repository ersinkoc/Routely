import { useParams } from '@oxog/routely-react';

// Define the expected params shape
interface CommentParams {
  postId: string;
  commentId: string;
}

export default function CommentDetail() {
  // Type-safe params access for multiple parameters
  const { postId, commentId } = useParams<CommentParams>();

  return (
    <div>
      <h2>Comment Detail</h2>
      <p><strong>Post ID:</strong> {postId}</p>
      <p><strong>Comment ID:</strong> {commentId}</p>
      <p>This page demonstrates accessing multiple dynamic route parameters.</p>

      <div style={{ marginTop: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '4px' }}>
        <h4>Code Example:</h4>
        <pre style={{ background: '#fff', padding: '10px' }}>
{`// Define route with multiple parameters
route('/posts/:postId/comments/:commentId', component)

// Access parameters in component
const { postId, commentId } = useParams<{
  postId: string;
  commentId: string;
}>()

console.log(postId)    // e.g., "1"
console.log(commentId)  // e.g., "5"`}
        </pre>
      </div>
    </div>
  );
}
