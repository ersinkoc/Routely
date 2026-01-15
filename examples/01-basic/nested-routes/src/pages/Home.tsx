import { Outlet } from '@oxog/routely-react';

export default function Home() {
  return (
    <div>
      <h1>Welcome to Nested Routes Example</h1>
      <p>Select a route from the sidebar to see nested routing in action.</p>
      <Outlet />
    </div>
  );
}
