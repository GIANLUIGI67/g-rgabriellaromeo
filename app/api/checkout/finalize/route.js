export const runtime = 'nodejs';

import { buildCheckoutQuote, finalizeCheckout, loadCustomerProfile } from '../../../lib/checkout';
import { jsonResponse, requireUser } from '../../../lib/serverAuth';
import { createServerSupabaseServiceClient } from '../../../lib/serverSupabase';
import { sendEmail } from '../../../lib/mailer';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

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

async function verifyPayPalCapture(transactionId) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('Missing PayPal server credentials');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
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

export async function POST(request) {
  try {
    const auth = await requireUser(request);
    if (auth.error) return auth.error;

    const {
      cart,
      shippingMethod,
      paymentMethod,
      paymentStatus,
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

    // Send confirmation email with invoice PDF (non-blocking)
    try {
      const pdfBytes = await buildInvoicePDF(order);
      await sendEmail({
        to: customer.email,
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
            <a href="https://g-rgabriellaromeo.vercel.app"
               style="display:inline-block;padding:12px 24px;background:#d4af37;color:#000;text-decoration:none;border-radius:6px;font-weight:bold;">
              Visita il negozio
            </a>
            <p style="margin-top:24px;font-size:12px;color:#666;">G-R Gabriella Romeo — info@g-rgabriellaromeo.it</p>
          </div>
        `,
        attachments: [
          {
            filename: `ricevuta_${order.id}.pdf`,
            content: Buffer.from(pdfBytes),
            contentType: 'application/pdf',
          },
        ],
      });
    } catch (emailErr) {
      console.error('Confirmation email failed (order still valid):', emailErr.message);
    }

    return jsonResponse({ ok: true, orderId: order.id, total: order.totale });
  } catch (error) {
    return jsonResponse({ error: error?.message || 'Unable to finalize checkout' }, 400);
  }
}
