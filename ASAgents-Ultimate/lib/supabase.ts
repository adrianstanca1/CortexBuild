/**
 * Supabase Client Configuration
 */

import { createClient } from '@supabase/supabase-js';
import environment from '../config/environment';

const supabaseUrl = environment.supabaseUrl;
const supabaseAnonKey = environment.supabaseAnonKey;

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export default supabase;
