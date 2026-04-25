import { createClient } from 'npm:@supabase/supabase-js@2.49.8';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const supabaseServiceRoleKey = Deno.env.get('SERVICE_ROLE_KEY') ?? '';

function assertClientEnv() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
  }
}

function assertServiceEnv() {
  assertClientEnv();
  if (!supabaseServiceRoleKey) {
    throw new Error('Missing SERVICE_ROLE_KEY');
  }
}

const authOptions = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
};

export function createAnonClient() {
  assertClientEnv();
  return createClient(supabaseUrl, supabaseAnonKey, authOptions);
}

export function createServiceClient() {
  assertServiceEnv();
  return createClient(supabaseUrl, supabaseServiceRoleKey, authOptions);
}
