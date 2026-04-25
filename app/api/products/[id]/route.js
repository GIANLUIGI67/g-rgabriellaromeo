import { jsonResponse, requireAdmin } from '../../../lib/serverAuth';
import { sanitizeProductPayload } from '../../../lib/adminProducts';

export async function PUT(request, { params }) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const id = params.id;
  let body;
  try {
    body = sanitizeProductPayload(await request.json());
  } catch (error) {
    return jsonResponse({ error: error.message }, 400);
  }

  const { data, error } = await auth.service
    .from('products')
    .update(body)
    .eq('id', id)
    .select('*')
    .single();

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
