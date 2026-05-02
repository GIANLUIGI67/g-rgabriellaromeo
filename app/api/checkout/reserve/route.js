export const runtime = 'nodejs';

import { buildCheckoutQuote, createTemporaryOrder, loadCustomerProfile } from '../../../lib/checkout';
import { jsonResponse, requireUser } from '../../../lib/serverAuth';
import { createServerSupabaseServiceClient } from '../../../lib/serverSupabase';
import { sendEmail } from '../../../lib/mailer';

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

    // Send pending order email with bank transfer details (non-blocking)
    try {
      await sendEmail({
        to: customer.email,
        subject: `Ordine ricevuto N. ${tempOrder.id} — in attesa di bonifico — G-R Gabriella Romeo`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:32px;">
            <h2 style="color:#d4af37;">Ordine ricevuto!</h2>
            <p>Ciao <strong>${customer.nome || customer.email}</strong>,</p>
            <p>Abbiamo ricevuto il tuo ordine <strong>${tempOrder.id}</strong> per un totale di <strong>EUR ${Number(tempOrder.totale).toFixed(2)}</strong>.</p>
            <p>Per completare l'acquisto, effettua il bonifico con i seguenti dati:</p>
            <div style="background:#f5f5f5;padding:16px;border-radius:6px;margin:16px 0;">
              <p style="margin:4px 0;color:#000;"><strong>Intestatario:</strong> Gabriella Romeo</p>
              <p style="margin:4px 0;color:#000;"><strong>IBAN:</strong> IT10 Y050 3426 2010 0000 0204 438</p>
              <p style="margin:4px 0;color:#000;"><strong>Causale:</strong> Ordine ${tempOrder.id}</p>
              <p style="margin:4px 0;color:#000;"><strong>Importo:</strong> EUR ${Number(tempOrder.totale).toFixed(2)}</p>
            </div>
            <p>Una volta verificato il pagamento, riceverai una email di conferma e il tuo ordine verrà spedito.</p>
            <br/>
            <a href="https://g-rgabriellaromeo.vercel.app"
               style="display:inline-block;padding:12px 24px;background:#d4af37;color:#000;text-decoration:none;border-radius:6px;font-weight:bold;">
              Visita il negozio
            </a>
            <p style="margin-top:24px;font-size:12px;color:#666;">G-R Gabriella Romeo — info@g-rgabriellaromeo.it</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error('Bonifico email failed (order still valid):', emailErr.message);
    }

    return jsonResponse({ ok: true, tempOrderId: tempOrder.id, total: tempOrder.totale });
  } catch (error) {
    return jsonResponse({ error: error?.message || 'Unable to reserve order' }, 400);
  }
}
