import { buildCheckoutQuote, finalizeCheckout, loadCustomerProfile } from '../_shared/checkout.ts';
import { jsonResponse, corsHeaders } from '../_shared/cors.ts';
import { requireUser } from '../_shared/auth.ts';
import { createServiceClient } from '../_shared/supabase.ts';

async function verifyPayPalCapture(transactionId: string) {
  const clientId = Deno.env.get('NEXT_PUBLIC_PAYPAL_CLIENT_ID');
  const clientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
  if (!clientId || !clientSecret) {
    throw new Error('Missing PayPal server credentials');
  }

  const auth = btoa(`${clientId}:${clientSecret}`);
  const tokenRes = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!tokenRes.ok) throw new Error('Unable to authenticate with PayPal');

  const tokenJson = await tokenRes.json();
  const captureRes = await fetch(`https://api-m.paypal.com/v2/payments/captures/${transactionId}`, {
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
      paymentStatus,
      transactionId = null,
    } = await request.json();

    const service = createServiceClient();
    const customer = await loadCustomerProfile(service, auth.user.email ?? '');
    const quote = await buildCheckoutQuote({ service, customer, cart, shippingMethod });

    if (paymentMethod === 'PayPal') {
      if (!transactionId) {
        return jsonResponse({ error: 'Missing PayPal transaction id' }, 400);
      }
      await verifyPayPalCapture(transactionId);
    }

    const order = await finalizeCheckout({
      service,
      customer,
      quote,
      paymentMethod,
      paymentStatus,
      transactionId,
    });

    return jsonResponse({ ok: true, orderId: order.id, total: order.totale });
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : 'Unable to finalize checkout' }, 400);
  }
});
