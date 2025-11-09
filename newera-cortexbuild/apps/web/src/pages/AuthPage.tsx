import React, { useState } from 'react';
import { useAuth } from '../providers/AuthProvider';

export const AuthPage: React.FC = () => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({
    tenantName: '',
    tenantSlug: '',
    fullName: '',
    email: '',
    password: '',
    plan: 'starter'
  });
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(undefined);
    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password });
      } else {
        await register(form);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <div style={{ width: 420, padding: 32, borderRadius: 16, boxShadow: '0 12px 40px rgba(15,23,42,.15)', background: 'white' }}>
        <h1>{mode === 'login' ? 'Welcome back' : 'Create your workspace'}</h1>
        <p>NewEra CortexBuild for forward-thinking builders</p>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, marginTop: 24 }}>
          {mode === 'register' && (
            <>
              <input name="tenantName" placeholder="Company name" value={form.tenantName} onChange={handleChange} required />
              <input name="tenantSlug" placeholder="Workspace slug" value={form.tenantSlug} onChange={handleChange} required />
              <input name="fullName" placeholder="Your name" value={form.fullName} onChange={handleChange} required />
              <select name="plan" value={form.plan} onChange={handleChange}>
                <option value="starter">Starter</option>
                <option value="growth">Growth</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </>
          )}
          <input name="email" placeholder="Email" type="email" value={form.email} onChange={handleChange} required />
          <input name="password" placeholder="Password" type="password" value={form.password} onChange={handleChange} required />
          <button disabled={loading}>{loading ? 'Working...' : mode === 'login' ? 'Sign in' : 'Create workspace'}</button>
          {error && <p style={{ color: '#f97066' }}>{error}</p>}
        </form>
        <div style={{ marginTop: 16 }}>
          {mode === 'login' ? (
            <button className="link" onClick={() => setMode('register')}>
              Need an account? Create one
            </button>
          ) : (
            <button className="link" onClick={() => setMode('login')}>
              Already onboard? Sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
