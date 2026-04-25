import Stripe from 'npm:stripe@18.4.0';
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

    const secret = Deno.env.get('STRIPE_SECRET_KEY');
    if (!secret) return jsonResponse({ error: 'Missing STRIPE_SECRET_KEY' }, 500);

    const stripe = new Stripe(secret, { apiVersion: '2024-06-20' });
    const body = await request.json().catch(() => ({}));
    const currency = String(body?.currency || 'eur').toLowerCase();
    const service = createServiceClient();
    const customer = await loadCustomerProfile(service, auth.user.email ?? '');
    const quote = await buildCheckoutQuote({
      service,
      customer,
      cart: body?.cart,
      shippingMethod: body?.shippingMethod,
    });

    const amount = Math.round(quote.total * 100);
    const metadata = {
      email: auth.user.email ?? '',
      shipping_method: body?.shippingMethod ?? '',
      customer_id: customer?.id ?? '',
    };

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata,
      automatic_payment_methods: { enabled: true },
    });

    return jsonResponse({ clientSecret: paymentIntent.client_secret, total: quote.total }, 200);
  } catch (error) {
    console.error('payment-intent error:', error);
    return jsonResponse({ error: error instanceof Error ? error.message : 'Server error' }, 500);
  }
});
