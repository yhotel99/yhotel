import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'MISSING');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'MISSING');
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

console.log('Supabase initialized with URL:', supabaseUrl ? 'Set' : 'Missing');

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

