"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // For local demo, just redirect to login
    router.push('/login');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <input className="w-full border rounded px-3 py-2" placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="Email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white rounded px-3 py-2">{loading? 'Creating...' : 'Sign up'}</button>
      </form>
    </div>
  );
}


