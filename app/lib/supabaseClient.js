import { createClient } from '@supabase/supabase-js';
import { supabaseAnonKey, supabaseUrl } from './supabaseConfig';

const safeUrl = supabaseUrl || 'https://placeholder.supabase.co';
const safeAnonKey = supabaseAnonKey || 'placeholder-anon-key';

export const supabase = createClient(safeUrl, safeAnonKey);
