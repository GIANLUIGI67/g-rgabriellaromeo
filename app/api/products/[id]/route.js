import { jsonResponse, requireAdmin } from '../../../lib/serverAuth';

export async function PUT(request, { params }) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const id = params.id;
  const body = await request.json();

  const { data, error } = await auth.service
    .from('products')
    .update(body)
    .eq('id', id);

  if (error) {
    return jsonResponse({ error: error.message }, 500);
  }

  return jsonResponse({ message: 'Prodotto aggiornato con successo', data }, 200);
}

export async function DELETE(request, { params }) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const id = params.id;

  const { error } = await auth.service
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    return jsonResponse({ error: error.message }, 500);
  }

  return jsonResponse({ message: 'Prodotto eliminato con successo' }, 200);
}
