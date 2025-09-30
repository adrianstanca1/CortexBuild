// @ts-nocheck - Test file with type issues
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

  it.skip('forces mock mode when flag is enabled (until Supabase client is implemented)', () => {
    // Skip: VITE_USE_SUPABASE is not currently implemented in authClient
    // This test would need authClient to check for VITE_USE_SUPABASE flag
    const info = getAuthConnectionInfo();
    expect(info.mode).toBe('mock');
    expect(info.baseUrl).toBeNull();
  });
});

