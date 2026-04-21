import { createClient } from '@supabase/supabase-js';
import {
  assertSupabaseClientEnv,
  assertSupabaseServiceEnv,
  supabaseAnonKey,
  supabaseServiceRoleKey,
  supabaseUrl,
} from './supabaseConfig';

const authOptions = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
};

export function createServerSupabaseAnonClient() {
  assertSupabaseClientEnv();
  return createClient(supabaseUrl, supabaseAnonKey, authOptions);
}

export function createServerSupabaseServiceClient() {
  assertSupabaseServiceEnv();
  return createClient(supabaseUrl, supabaseServiceRoleKey, authOptions);
}
