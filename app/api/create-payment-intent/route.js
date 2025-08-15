export const runtime = 'nodejs';

import Stripe from 'stripe';

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export async function POST(req) {
  try {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) return json({ error: 'Missing STRIPE_SECRET_KEY' }, 500);

    const stripe = new Stripe(secret, { apiVersion: '2024-06-20' });

    const body = await req.json().catch(() => ({}));
    const amount = Number(body?.amount ?? 0); // centesimi
    const currency = (body?.currency || 'eur').toLowerCase();
    const metadata = typeof body?.metadata === 'object' ? body.metadata : {};

    if (!Number.isFinite(amount) || amount < 50) {
      return json({ error: 'Invalid amount (min 50 cents).' }, 400);
    }

    const pi = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata,
      automatic_payment_methods: { enabled: true },
    });

    return json({ clientSecret: pi.client_secret }, 200);
  } catch (err) {
    console.error('create-payment-intent error:', err);
    return json({ error: err?.message || 'Server error' }, 500);
  }
}

export async function GET()  { return json({ error: 'Method Not Allowed' }, 405); }
export async function PUT()  { return json({ error: 'Method Not Allowed' }, 405); }
export async function DELETE(){ return json({ error: 'Method Not Allowed' }, 405); }
