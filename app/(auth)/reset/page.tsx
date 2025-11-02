"use client";
import React, { useState } from 'react';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Reset password</h1>
        {sent ? (
          <p className="text-green-700">If an account exists, a reset email was sent.</p>
        ) : (
          <>
            <input className="w-full border rounded px-3 py-2" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
            <button onClick={()=>setSent(true)} className="w-full bg-blue-600 text-white rounded px-3 py-2">Send reset link</button>
          </>
        )}
      </div>
    </div>
  );
}


