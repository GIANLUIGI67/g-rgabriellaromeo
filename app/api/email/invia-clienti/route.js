import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../lib/serverAuth';
import { sendEmail } from '../../../lib/mailer';

export async function POST(request) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const { destinatari } = await request.json().catch(() => ({}));
  if (!Array.isArray(destinatari) || destinatari.length === 0) {
    return NextResponse.json({ error: 'Nessun destinatario selezionato' }, { status: 400 });
  }

  try {
    await sendEmail({
      to: destinatari,
      subject: '📣 Novità da G-R Gabriella Romeo',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;">
          <h2 style="color:#d4af37;">G-R Gabriella Romeo</h2>
          <p>Ciao! Ti scriviamo per aggiornarti sulle ultime novità e offerte del nostro negozio.</p>
          <p>Visita il nostro sito per scoprire tutti i prodotti disponibili.</p>
          <a href="https://g-rgabriellaromeo.vercel.app"
             style="display:inline-block;margin-top:16px;padding:12px 24px;background:#d4af37;color:#000;text-decoration:none;border-radius:6px;font-weight:bold;">
            Visita il negozio
          </a>
        </div>
      `,
    });
    return NextResponse.json({ ok: true, count: destinatari.length });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
