// /app/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xmiaatzxskmuxyzsvyjn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtaWFhdHp4c2ttdXh5enN2eWpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyNzQ5OTcsImV4cCI6MjA2Mzg1MDk5N30.w6NrnprfHIannP7IKX2AucbRDbzB9df1IKgss_4AYJI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
