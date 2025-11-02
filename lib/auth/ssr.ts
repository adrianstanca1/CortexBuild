import { cookies } from 'next/headers';

export type SessionUser = {
  id: string;
  email: string;
  name?: string;
  role?: string;
};

export function getUserFromCookies(): SessionUser | null {
  const store = cookies();
  const id = store.get('uid')?.value;
  const email = store.get('email')?.value;
  const name = store.get('name')?.value;
  const role = store.get('role')?.value;
  if (!id || !email) return null;
  return { id, email, name, role };
}

export function requireRole(allowed: string[]): boolean {
  const store = cookies();
  const role = store.get('role')?.value;
  if (!role) return false;
  return allowed.includes(role);
}


