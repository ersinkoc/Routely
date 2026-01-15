export default function Home() {
  return (
    <div>
      <h2>Home</h2>
      <p>Welcome to the Dynamic Route Parameters example!</p>
      <p>This example demonstrates how to use dynamic route parameters in Routely.</p>

      <h3>Features:</h3>
      <ul>
        <li><strong>Single parameter:</strong> /users/:userId</li>
        <li><strong>Multiple parameters:</strong> /posts/:postId/comments/:commentId</li>
        <li><strong>Type-safe access:</strong> Use useParams() hook with TypeScript generics</li>
      </ul>

      <p>Click the navigation links above to see dynamic parameters in action!</p>
    </div>
  );
}
