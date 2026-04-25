import { buildCheckoutQuote, loadCustomerProfile } from '../_shared/checkout.ts';
import { jsonResponse, corsHeaders } from '../_shared/cors.ts';
import { requireUser } from '../_shared/auth.ts';
import { createServiceClient } from '../_shared/supabase.ts';

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method Not Allowed' }, 405);
  }

  try {
    const auth = await requireUser(request);
    if ('error' in auth) return auth.error;

    const { cart, shippingMethod } = await request.json();
    const service = createServiceClient();
    const customer = await loadCustomerProfile(service, auth.user.email ?? '');
    const quote = await buildCheckoutQuote({
      service,
      customer,
      cart,
      shippingMethod,
      productionPolicyAccepted: true,
    });

    return jsonResponse({ ok: true, quote });
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : 'Unable to build checkout quote' }, 400);
  }
});
