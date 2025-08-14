import { createClient } from '@supabase/supabase-js';

let supabaseClient: ReturnType<typeof createClient> | null = null;

function initializeSupabase() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set. Please check your environment variables."
    );
  }

  if (!supabaseClient) {
    // Use service role key for server-side operations
    supabaseClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
  }

  return supabaseClient;
}

// Export getter function instead of direct export
export function getSupabase() {
  return initializeSupabase();
}

// Storage bucket name getter
export function getStorageBucket() {
  return process.env.SUPABASE_STORAGE_BUCKET || 'form-images';
}

// For backward compatibility
export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'form-images';