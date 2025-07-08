import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { getEnvConfig } from '@/lib/env-validation';

// Create a mock client for test environments without proper env setup
const createMockClient = () => ({
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signOut: () => Promise.resolve({ error: null })
  },
  from: () => ({ select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }) })
} as any);

let supabase: any;

try {
  // Get validated environment configuration
  const envConfig = getEnvConfig();

  // Create Supabase client with environment variables
  supabase = createClient<Database>(
    envConfig.VITE_SUPABASE_URL,
    envConfig.VITE_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      global: {
        headers: {
          'X-Client-Info': `${envConfig.VITE_APP_NAME}/${envConfig.VITE_APP_VERSION}`,
        },
      },
    }
  );
} catch (error) {
  console.warn('Failed to initialize Supabase client, using mock client:', error);
  supabase = createMockClient();
}

export { supabase };

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";