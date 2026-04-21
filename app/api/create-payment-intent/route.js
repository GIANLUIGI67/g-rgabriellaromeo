export const runtime = 'nodejs';

import Stripe from 'stripe';
import { buildCheckoutQuote, loadCustomerProfile } from '../../lib/checkout';
import { jsonResponse, requireUser } from '../../lib/serverAuth';
import { createServerSupabaseServiceClient } from '../../lib/serverSupabase';

export async function POST(req) {
  try {
    const auth = await requireUser(req);
    if (auth.error) return auth.error;

    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) return jsonResponse({ error: 'Missing STRIPE_SECRET_KEY' }, 500);

    const stripe = new Stripe(secret, { apiVersion: '2024-06-20' });
    const body = await req.json().catch(() => ({}));
    const currency = (body?.currency || 'eur').toLowerCase();
    const service = createServerSupabaseServiceClient();
    const customer = await loadCustomerProfile(service, auth.user.email);
    const quote = await buildCheckoutQuote({
      service,
      customer,
      cart: body?.cart,
      shippingMethod: body?.shippingMethod,
    });
    const amount = Math.round(quote.total * 100);
    const metadata = {
      email: auth.user.email,
      shipping_method: body?.shippingMethod,
      customer_id: customer?.id || '',
    };

    const pi = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata,
      automatic_payment_methods: { enabled: true },
    });

    return jsonResponse({ clientSecret: pi.client_secret, total: quote.total }, 200);
  } catch (err) {
    console.error('create-payment-intent error:', err);
    return jsonResponse({ error: err?.message || 'Server error' }, 500);
  }
}

export async function GET()  { return jsonResponse({ error: 'Method Not Allowed' }, 405); }
export async function PUT()  { return jsonResponse({ error: 'Method Not Allowed' }, 405); }
export async function DELETE(){ return jsonResponse({ error: 'Method Not Allowed' }, 405); }
