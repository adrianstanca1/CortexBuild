import React from 'react';
import { supabase } from '../services/supabaseClient';
import { Button } from './ui/Button';

export const SupabaseOAuthButtons: React.FC = () => {
  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    await supabase.auth.signInWithOAuth({ provider });
  };

  return (
    <div className="flex flex-col gap-2 mt-4">
      <Button type="button" onClick={() => handleOAuthLogin('google')}>
        Continue with Google
      </Button>
      <Button type="button" onClick={() => handleOAuthLogin('github')}>
        Continue with GitHub
      </Button>
    </div>
  );
};