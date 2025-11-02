import React from 'react';
import { requireRole } from '../../lib/auth/ssr';
import { redirect } from 'next/navigation';

export default function AdminPage() {
  const allowed = requireRole(['super_admin', 'company_admin']);
  if (!allowed) redirect('/login?next=/admin');
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <p className="mt-2 text-gray-600">Restricted administrative area.</p>
    </div>
  );
}


