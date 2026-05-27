const DEFAULT_PAYPAL_API_BASE =
  process.env.NEXT_PUBLIC_PAYPAL_ENV === 'sandbox'
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com';

export function getPayPalApiBase() {
  return (process.env.PAYPAL_API_BASE || DEFAULT_PAYPAL_API_BASE).replace(/\/$/, '');
}

async function getPayPalAccessToken() {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('Missing PayPal server credentials');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const tokenRes = await fetch(`${getPayPalApiBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!tokenRes.ok) throw new Error('Unable to authenticate with PayPal');

  const tokenJson = await tokenRes.json();
  if (!tokenJson.access_token) throw new Error('PayPal access token missing');
  return tokenJson.access_token;
}

export async function createPayPalCheckoutOrder({
  total,
  currency = 'EUR',
  description = 'Ordine GR Gabriella Romeo',
  returnUrl,
  cancelUrl,
}) {
  const token = await getPayPalAccessToken();
  const orderRes = await fetch(`${getPayPalApiBase()}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: Number(total).toFixed(2),
          },
          description,
        },
      ],
      application_context: {
        return_url: returnUrl,
        cancel_url: cancelUrl,
        user_action: 'PAY_NOW',
      },
    }),
  });

  if (!orderRes.ok) throw new Error('Unable to create PayPal order');
  return orderRes.json();
}

export async function capturePayPalCheckoutOrder(orderId) {
  const token = await getPayPalAccessToken();
  const captureRes = await fetch(`${getPayPalApiBase()}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!captureRes.ok) throw new Error('Unable to capture PayPal order');
  return captureRes.json();
}

export async function verifyPayPalCapture(transactionId) {
  const token = await getPayPalAccessToken();
  const captureRes = await fetch(`${getPayPalApiBase()}/v2/payments/captures/${transactionId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!captureRes.ok) throw new Error('Unable to verify PayPal capture');

  const capture = await captureRes.json();
  if (capture.status !== 'COMPLETED') {
    throw new Error('PayPal capture is not completed');
  }
  return capture;
}

export function extractPayPalCaptureId(captureOrder) {
  return captureOrder?.purchase_units?.[0]?.payments?.captures?.[0]?.id || null;
}

export function extractPayPalCapturedAmount(captureOrder) {
  const amount = captureOrder?.purchase_units?.[0]?.payments?.captures?.[0]?.amount;
  return {
    currency: amount?.currency_code || null,
    value: amount?.value ? Number(amount.value) : null,
  };
}
