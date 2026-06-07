import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'MISSING');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'MISSING');
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

// OPTIMIZED: Configure Supabase client with connection pooling and performance settings
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Server-side doesn't need session persistence
    autoRefreshToken: false, // Server-side doesn't need auto refresh
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application-name': 'yhotel-server', // For monitoring
    },
  },
});

/** Bypass RLS for trusted server-side mutations (e.g. website checkout). */
export function createServiceSupabase() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: 'public' },
  });
}

