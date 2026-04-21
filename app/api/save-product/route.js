export async function POST(request) {
  try {
    const { requireAdmin, jsonResponse } = await import('../../lib/serverAuth');
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    const prodotto = await request.json();
    const result = await auth.service.from('products').insert([prodotto]);

    if (result.error) {
      console.error('save-product error:', result.error);
      return jsonResponse({ error: result.error.message || 'Errore Supabase' }, 500);
    }

    return jsonResponse({ message: 'Prodotto salvato con successo' }, 200);
  } catch (error) {
    console.error('save-product catch:', error);
    return new Response(JSON.stringify({
      error: error?.message || 'Errore generico su Supabase'
    }), {
      status: 500,
    });
  }
}
