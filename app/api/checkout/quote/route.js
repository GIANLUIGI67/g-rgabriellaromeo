export const runtime = 'nodejs';

import { buildCheckoutQuote, loadCustomerProfile } from '../../../lib/checkout';
import { jsonResponse, requireUser } from '../../../lib/serverAuth';
import { createServerSupabaseServiceClient } from '../../../lib/serverSupabase';

export async function POST(request) {
  try {
    const auth = await requireUser(request);
    if (auth.error) return auth.error;

    const { cart, shippingMethod } = await request.json();
    const service = createServerSupabaseServiceClient();
    const customer = await loadCustomerProfile(service, auth.user.email);
    const quote = await buildCheckoutQuote({ service, customer, cart, shippingMethod });

    return jsonResponse({ ok: true, quote });
  } catch (error) {
    return jsonResponse({ error: error?.message || 'Unable to build checkout quote' }, 400);
  }
}
