import { Outlet } from '@oxog/routely-react';

export default function Dashboard() {
  return (
    <div>
      <h2>Dashboard</h2>
      <Outlet />
    </div>
  );
}
