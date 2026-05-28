export const runtime = 'nodejs';

import { buildCheckoutQuote, finalizeCheckout, loadCustomerProfile } from '../../../lib/checkout';
import { jsonResponse, requireUser } from '../../../lib/serverAuth';
import { createServerSupabaseServiceClient } from '../../../lib/serverSupabase';
import { sendEmail } from '../../../lib/mailer';
import { getSiteUrl } from '../../../lib/siteUrl';
import { verifyPayPalCapture } from '../../../lib/paypal';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import Stripe from 'stripe';

const ORDER_NOTIFICATION_CC = process.env.ORDER_NOTIFICATION_CC || 'info@gabriellaromeo.it';

function withTimeout(promise, timeoutMs, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timeout after ${timeoutMs}ms`)), timeoutMs);
    }),
  ]);
}

async function buildInvoicePDF(order) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const { height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const draw = (text, x, y, size = 12) =>
    page.drawText(String(text ?? ''), { x, y, size, font, color: rgb(0, 0, 0) });

  let y = height - 50;
  draw('G-R Gabriella Romeo - Ricevuta Ordine', 50, y, 16);
  y -= 30;
  draw(`Ordine N.: ${order.id}`, 50, y);
  draw(`Data: ${new Date(order.data).toLocaleDateString('it-IT')}`, 350, y);
  y -= 22;
  draw(`Cliente: ${order.cliente?.nome || ''} ${order.cliente?.cognome || ''}`, 50, y);
  y -= 18;
  draw(`Email: ${order.cliente?.email || ''}`, 50, y);
  y -= 28;
  draw('Prodotti:', 50, y, 13);
  y -= 20;
  (order.carrello || []).forEach(p => {
    const taglia = p.taglia ? ` (${p.taglia})` : '';
    draw(`• ${p.nome}${taglia}  x${p.quantita}  —  EUR ${Number(p.prezzo).toFixed(2)}`, 60, y);
    y -= 18;
  });
  y -= 10;
  draw(`Spedizione: ${order.spedizione}`, 50, y);
  y -= 18;
  draw(`Metodo pagamento: ${order.pagamento}`, 50, y);
  y -= 22;
  draw(`TOTALE: EUR ${Number(order.totale).toFixed(2)}`, 50, y, 14);

  return pdfDoc.save();
}

function normalizePaymentMethod(value) {
  const method = String(value || '').trim().toLowerCase();
  if (method === 'paypal') return 'PayPal';
  if (['carta', 'card', 'stripe', 'carta di credito', 'credit card', 'carta di credito/debito'].includes(method)) {
    return 'Carta di Credito';
  }
  return null;
}

async function verifyStripePaymentIntent(transactionId, quote) {
  const secret = process.env.STRIPE_SECRET_KEY;
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

export async function POST(request) {
  try {
    const auth = await requireUser(request);
    if (auth.error) return auth.error;

    const {
      cart,
      shippingMethod,
      paymentMethod,
      transactionId = null,
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

    // Send confirmation email with invoice PDF (non-blocking)
    try {
      const siteUrl = getSiteUrl();
      const pdfBytes = await buildInvoicePDF(order);
      await withTimeout(sendEmail({
        to: customer.email,
        cc: ORDER_NOTIFICATION_CC,
        subject: `Ordine confermato N. ${order.id} — G-R Gabriella Romeo`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:32px;">
            <h2 style="color:#d4af37;">Grazie per il tuo ordine!</h2>
            <p>Ciao <strong>${customer.nome || customer.email}</strong>,</p>
            <p>Il tuo ordine <strong>${order.id}</strong> è stato confermato e pagato con successo.</p>
            <p><strong>Totale:</strong> EUR ${Number(order.totale).toFixed(2)}</p>
            <p>In allegato trovi la ricevuta del tuo ordine in formato PDF.</p>
            <p>Riceverai un'email con il numero di tracking non appena il pacco sarà spedito.</p>
            <br/>
            <a href="${siteUrl}"
               style="display:inline-block;padding:12px 24px;background:#d4af37;color:#000;text-decoration:none;border-radius:6px;font-weight:bold;">
              Visita il negozio
            </a>
            <p style="margin-top:24px;font-size:12px;color:#666;">G-R Gabriella Romeo — info@gabriellaromeo.it</p>
          </div>
        `,
        attachments: [
          {
            filename: `ricevuta_${order.id}.pdf`,
            content: Buffer.from(pdfBytes),
            contentType: 'application/pdf',
          },
        ],
      }), 4000, 'Confirmation email');
    } catch (emailErr) {
      console.error('Confirmation email failed (order still valid):', emailErr.message);
    }

    return jsonResponse({ ok: true, orderId: order.id, total: order.totale });
  } catch (error) {
    return jsonResponse({ error: error?.message || 'Unable to finalize checkout' }, 400);
  }
}
