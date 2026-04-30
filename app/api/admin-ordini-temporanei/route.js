import { adminConfirmTemporaryOrder, adminRejectTemporaryOrder } from '../../lib/checkout';
import { jsonResponse, requireAdmin } from '../../lib/serverAuth';

/**
 * GET /api/admin-ordini-temporanei
 * Returns all records in ordini_temporanei ordered by creation date (newest first).
 */
export async function GET(request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    const { data, error } = await auth.service
      .from('ordini_temporanei')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return jsonResponse({ ok: false, error: error.message }, 500);
    return jsonResponse({ ok: true, ordini_temporanei: data || [] });
  } catch (e) {
    return jsonResponse({ ok: false, error: e.message }, 500);
  }
}

/**
 * PATCH /api/admin-ordini-temporanei
 * Body: { id: string, action: 'confirm' | 'reject' }
 * confirm → moves order to ordini, restores nothing (inventory already reserved)
 * reject  → restores products.quantita, deletes temp order
 */
export async function PATCH(request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    const body = await request.json().catch(() => ({}));
    const id = String(body?.id || '').trim();
    const action = String(body?.action || '').trim();

    if (!id) return jsonResponse({ ok: false, error: 'Missing order id' }, 400);
    if (action !== 'confirm' && action !== 'reject') {
      return jsonResponse({ ok: false, error: 'action must be "confirm" or "reject"' }, 400);
    }

    if (action === 'confirm') {
      const order = await adminConfirmTemporaryOrder({ service: auth.service, tempOrderId: id });
      return jsonResponse({ ok: true, ordine: order });
    }

    await adminRejectTemporaryOrder({ service: auth.service, tempOrderId: id });
    return jsonResponse({ ok: true });
  } catch (e) {
    return jsonResponse({ ok: false, error: e.message }, 500);
  }
}
