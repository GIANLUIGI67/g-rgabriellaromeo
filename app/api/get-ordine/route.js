import { supabase } from '../../../lib/supabaseClient';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  const { data, error } = await supabase
    .from('ordini')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  return new Response(JSON.stringify(data));
}
