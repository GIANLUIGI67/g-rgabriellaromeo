export const runtime = 'nodejs';

import { buildCheckoutQuote, loadCustomerProfile } from '../../../lib/checkout';
import { createPayPalCheckoutOrder } from '../../../lib/paypal';
import { jsonResponse, requireUser } from '../../../lib/serverAuth';
import { createServerSupabaseServiceClient } from '../../../lib/serverSupabase';
import { getSiteUrlForPath } from '../../../lib/siteUrl';

const ANDROID_RETURN_URL = getSiteUrlForPath('/paypal/android-return');
const ANDROID_CANCEL_URL = getSiteUrlForPath('/paypal/android-cancel');

export async function POST(request) {
  try {
    const auth = await requireUser(request);
    if (auth.error) return auth.error;

    const {
      cart,
      shippingMethod,
      productionPolicyAccepted = false,
      returnUrl = ANDROID_RETURN_URL,
      cancelUrl = ANDROID_CANCEL_URL,
    } = await request.json().catch(() => ({}));

    const service = createServerSupabaseServiceClient();
    const customer = await loadCustomerProfile(service, auth.user.email);
    const quote = await buildCheckoutQuote({
      service,
      customer,
      cart,
      shippingMethod,
      productionPolicyAccepted,
    });

    const paypalOrder = await createPayPalCheckoutOrder({
      total: quote.total,
      returnUrl,
      cancelUrl,
    });
    const approvalUrl = paypalOrder.links?.find((link) => link.rel === 'approve')?.href;
    if (!paypalOrder.id || !approvalUrl) {
      throw new Error('PayPal approval link missing');
    }

    return jsonResponse({
      ok: true,
      orderId: paypalOrder.id,
      approvalUrl,
      total: quote.total,
    });
  } catch (error) {
    return jsonResponse({ error: error?.message || 'Unable to create PayPal order' }, 400);
  }
}
