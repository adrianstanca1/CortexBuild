import React from 'react';
import { getUserFromCookies } from '../../../lib/auth/ssr';

export default function DashboardPage() {
  const user = getUserFromCookies();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-gray-600">Welcome {user?.name || user?.email || 'Guest'}.</p>
    </div>
  );
}


