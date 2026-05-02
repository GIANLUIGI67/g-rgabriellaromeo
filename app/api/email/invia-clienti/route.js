import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { requireAdmin } from '../../../lib/serverAuth';

export async function POST(request) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const { destinatari } = await request.json().catch(() => ({}));
  if (!Array.isArray(destinatari) || destinatari.length === 0) {
    return NextResponse.json({ error: 'Nessun destinatario selezionato' }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'RESEND_API_KEY non configurata' }, { status: 500 });

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: 'info@g-rgabriellaromeo.it',
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

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, count: destinatari.length });
}
