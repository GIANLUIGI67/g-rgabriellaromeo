import Stripe from 'npm:stripe@18.4.0';
import { buildCheckoutQuote, finalizeCheckout, loadCustomerProfile } from '../_shared/checkout.ts';
import { jsonResponse, corsHeaders } from '../_shared/cors.ts';
import { requireUser } from '../_shared/auth.ts';
import { createServiceClient } from '../_shared/supabase.ts';

function paypalApiBase() {
  const fallback = Deno.env.get('NEXT_PUBLIC_PAYPAL_ENV') === 'sandbox'
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com';
  return (Deno.env.get('PAYPAL_API_BASE') || fallback).replace(/\/$/, '');
}

async function verifyPayPalCapture(transactionId: string) {
  const clientId = Deno.env.get('NEXT_PUBLIC_PAYPAL_CLIENT_ID');
  const clientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
  if (!clientId || !clientSecret) {
    throw new Error('Missing PayPal server credentials');
  }

  const auth = btoa(`${clientId}:${clientSecret}`);
  const tokenRes = await fetch(`${paypalApiBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!tokenRes.ok) throw new Error('Unable to authenticate with PayPal');

  const tokenJson = await tokenRes.json();
  const captureRes = await fetch(`${paypalApiBase()}/v2/payments/captures/${transactionId}`, {
    headers: {
      Authorization: `Bearer ${tokenJson.access_token}`,
    },
  });

  if (!captureRes.ok) throw new Error('Unable to verify PayPal capture');

  const capture = await captureRes.json();
  if (capture.status !== 'COMPLETED') {
    throw new Error('PayPal capture is not completed');
  }
}

function normalizePaymentMethod(value: unknown) {
  const method = String(value || '').trim().toLowerCase();
  if (method === 'paypal') return 'PayPal';
  if (['carta', 'card', 'stripe', 'carta di credito', 'credit card', 'carta di credito/debito'].includes(method)) {
    return 'Carta di Credito';
  }
  return null;
}

async function verifyStripePaymentIntent(transactionId: string | null, quote: { total: number }) {
  const secret = Deno.env.get('STRIPE_SECRET_KEY');
  if (!secret) throw new Error('Missing STRIPE_SECRET_KEY');
  if (!transactionId) throw new Error('Missing Stripe payment intent id');

  const stripe = new Stripe(secret, { apiVersion: '2024-06-20' });
  const paymentIntent = await stripe.paymentIntents.retrieve(transactionId);
  if (paymentIntent.status !== 'succeeded') {
    throw new Error('Stripe payment is not completed');
  }

  const expectedAmount = Math.round(Number(quote.total) * 100);
  if (paymentIntent.currency !== 'eur' || paymentIntent.amount_received !== expectedAmount) {
    throw new Error('Stripe payment amount does not match the order total');
  }
}

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

    const {
      cart,
      shippingMethod,
      paymentMethod,
      transactionId = null,
      productionPolicyAccepted = false,
    } = await request.json();

    const service = createServiceClient();
    const customer = await loadCustomerProfile(service, auth.user.email ?? '');
    const quote = await buildCheckoutQuote({
      service,
      customer,
      cart,
      shippingMethod,
      productionPolicyAccepted,
    });

    const normalizedPaymentMethod = normalizePaymentMethod(paymentMethod);
    if (!normalizedPaymentMethod) {
      return jsonResponse({ error: 'Unsupported payment method' }, 400);
    }

    if (normalizedPaymentMethod === 'PayPal') {
      if (!transactionId) {
        return jsonResponse({ error: 'Missing PayPal transaction id' }, 400);
      }
      await verifyPayPalCapture(transactionId);
    } else if (normalizedPaymentMethod === 'Carta di Credito') {
      await verifyStripePaymentIntent(transactionId, quote);
    }

    const order = await finalizeCheckout({
      service,
      customer,
      quote,
      paymentMethod: normalizedPaymentMethod,
      paymentStatus: 'pagato',
      transactionId,
    });

    return jsonResponse({ ok: true, orderId: order.id, total: order.totale });
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : 'Unable to finalize checkout' }, 400);
  }
});
