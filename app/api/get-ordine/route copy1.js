import { supabase } from '../../lib/supabaseClient';

export async function GET(request) {
  return new Response(JSON.stringify({ message: 'Ordine ricevuto OK' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
