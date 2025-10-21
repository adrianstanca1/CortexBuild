/**
 * Vercel Serverless Function: Test Environment Variables
 * GET /api/test-env
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
  const jwtSecret = process.env.JWT_SECRET;

  return res.status(200).json({
    env: {
      VITE_SUPABASE_URL: supabaseUrl ? 'SET' : 'NOT SET',
      SUPABASE_SERVICE_KEY: supabaseServiceKey ? 'SET (length: ' + supabaseServiceKey.length + ')' : 'NOT SET',
      JWT_SECRET: jwtSecret ? 'SET' : 'NOT SET',
    },
    supabaseUrl: supabaseUrl || 'NOT SET',
  });
}

