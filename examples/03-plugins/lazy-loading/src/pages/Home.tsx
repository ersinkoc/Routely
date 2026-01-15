export default function Home() {
  return (
    <div>
      <h2>Home</h2>
      <p>Welcome to the lazy loading example!</p>
      <p>Each page is loaded only when you navigate to it, reducing the initial bundle size.</p>

      <div style={{ marginTop: '20px', padding: '15px', background: '#e8f5e9', borderRadius: '4px' }}>
        <h4>Benefits of Lazy Loading:</h4>
        <ul>
          <li><strong>Smaller initial bundle:</strong> Only load code for the current route</li>
          <li><strong>Faster initial load:</strong> Users see content sooner</li>
          <li><strong>Better caching:</strong> Changed pages don't invalidate the entire bundle</li>
          <li><strong>Code splitting:</strong> Automatically split code by route</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', background: '#fff3e0', borderRadius: '4px' }}>
        <h4>How it works:</h4>
        <ol>
          <li>Routes are defined with dynamic imports: <code>route('/path', () => import('./Page'))</code></li>
          <li>The lazy plugin intercepts route changes</li>
          <li>Components are loaded on-demand using React.lazy()</li>
          <li>Suspense shows a loading state during loading</li>
        </ol>
      </div>
    </div>
  );
}
