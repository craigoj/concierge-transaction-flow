import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { getEnvConfig } from '@/lib/env-validation';

// Get validated environment configuration
const envConfig = getEnvConfig();

// Create Supabase client with environment variables
export const supabase = createClient<Database>(
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

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";