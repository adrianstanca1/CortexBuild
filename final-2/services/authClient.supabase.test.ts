import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getAuthConnectionInfo, resetAuthClient } from './authClient';

describe('Supabase gating (VITE_USE_SUPABASE)', () => {
  const original = process.env.VITE_USE_SUPABASE;

  beforeEach(() => {
    process.env.VITE_USE_SUPABASE = 'true';
    resetAuthClient();
  });

  afterEach(() => {
    if (original === undefined) delete (process.env as any).VITE_USE_SUPABASE;
    else process.env.VITE_USE_SUPABASE = original;
    resetAuthClient();
  });

  it('forces mock mode when flag is enabled (until Supabase client is implemented)', () => {
    const info = getAuthConnectionInfo();
    expect(info.mode).toBe('mock');
    expect(info.baseUrl).toBeNull();
  });
});

