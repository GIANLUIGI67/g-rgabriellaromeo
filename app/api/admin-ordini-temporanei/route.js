import { adminConfirmTemporaryOrder, adminRejectTemporaryOrder } from '../../lib/checkout';
import { jsonResponse, requireAdmin } from '../../lib/serverAuth';
import { sendEmail } from '../../lib/mailer';
import { getSiteUrl } from '../../lib/siteUrl';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

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
  (order.carrello || []).forEach((p) => {
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

async function sendBonificoConfirmedEmail(order) {
  const customerEmail = String(order?.cliente?.email || '').trim();
  if (!customerEmail) return;

  const siteUrl = getSiteUrl();
  const pdfBytes = await buildInvoicePDF(order);
  await withTimeout(sendEmail({
    to: customerEmail,
    cc: ORDER_NOTIFICATION_CC,
    subject: `Ordine confermato N. ${order.id} — G-R Gabriella Romeo`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:32px;">
        <h2 style="color:#d4af37;">Grazie per il tuo ordine!</h2>
        <p>Ciao <strong>${order.cliente?.nome || customerEmail}</strong>,</p>
        <p>Abbiamo confermato il tuo bonifico e il tuo ordine <strong>${order.id}</strong> è ora confermato.</p>
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
  }), 4000, 'Bonifico confirmation email');
}

/**
 * GET /api/admin-ordini-temporanei
 * Returns all records in ordini_temporanei ordered by creation date (newest first).
 */
export async function GET(request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    const { data, error } = await auth.service
      .from('ordini_temporanei')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return jsonResponse({ ok: false, error: error.message }, 500);
    return jsonResponse({ ok: true, ordini_temporanei: data || [] });
  } catch (e) {
    return jsonResponse({ ok: false, error: e.message }, 500);
  }
}

/**
 * PATCH /api/admin-ordini-temporanei
 * Body: { id: string, action: 'confirm' | 'reject' }
 * confirm → moves order to ordini, restores nothing (inventory already reserved)
 * reject  → restores products.quantita, deletes temp order
 */
export async function PATCH(request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    const body = await request.json().catch(() => ({}));
    const id = String(body?.id || '').trim();
    const action = String(body?.action || '').trim();

    if (!id) return jsonResponse({ ok: false, error: 'Missing order id' }, 400);
    if (action !== 'confirm' && action !== 'reject') {
      return jsonResponse({ ok: false, error: 'action must be "confirm" or "reject"' }, 400);
    }

    if (action === 'confirm') {
      const order = await adminConfirmTemporaryOrder({ service: auth.service, tempOrderId: id });
      try {
        await sendBonificoConfirmedEmail(order);
      } catch (emailErr) {
        console.error('Bonifico confirmation email failed (order still valid):', emailErr.message);
      }
      return jsonResponse({ ok: true, ordine: order });
    }

    await adminRejectTemporaryOrder({ service: auth.service, tempOrderId: id });
    return jsonResponse({ ok: true });
  } catch (e) {
    return jsonResponse({ ok: false, error: e.message }, 500);
  }
}
