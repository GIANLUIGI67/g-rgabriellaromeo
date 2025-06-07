import { supabase } from '../../../lib/supabaseClient';

export async function PUT(request, { params }) {
  const id = params.id;
  const body = await request.json();

  const { data, error } = await supabase
    .from('products')
    .update(body)
    .eq('id', id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ message: 'Prodotto aggiornato con successo', data }), { status: 200 });
}

export async function DELETE(request, { params }) {
  const id = params.id;

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ message: 'Prodotto eliminato con successo' }), { status: 200 });
}
