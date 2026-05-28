export const runtime = 'nodejs';

import { buildCheckoutQuote, createTemporaryOrder, loadCustomerProfile } from '../../../lib/checkout';
import { jsonResponse, requireUser } from '../../../lib/serverAuth';
import { createServerSupabaseServiceClient } from '../../../lib/serverSupabase';

/**
 * POST /api/checkout/reserve
 * Creates an ordini_temporanei record for bank-transfer (bonifico) orders
 * and immediately decrements products.quantita.
 * PayPal and credit-card orders do NOT use this endpoint.
 */
export async function POST(request) {
  try {
    const auth = await requireUser(request);
    if (auth.error) return auth.error;

    const {
      cart,
      shippingMethod,
      productionPolicyAccepted = false,
    } = await request.json();

    const service = createServerSupabaseServiceClient();
    const customer = await loadCustomerProfile(service, auth.user.email);
    const quote = await buildCheckoutQuote({
      service,
      customer,
      cart,
      shippingMethod,
      productionPolicyAccepted,
    });

    const tempOrder = await createTemporaryOrder({
      service,
      customer,
      quote,
      paymentMethod: 'bonifico',
    });

    return jsonResponse({ ok: true, tempOrderId: tempOrder.id, total: tempOrder.totale });
  } catch (error) {
    return jsonResponse({ error: error?.message || 'Unable to reserve order' }, 400);
  }
}
