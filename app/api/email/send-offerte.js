import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';
import { sendEmail } from '../../../lib/mailer';

export async function POST(req) {
  try {
    const { prodotti } = await req.json();

    if (!prodotti || prodotti.length === 0) {
      return NextResponse.json({ error: 'Nessun prodotto selezionato' }, { status: 400 });
    }

    const { data: clienti, error: clientiError } = await supabase
      .from('clienti')
      .select('email');

    if (clientiError) {
      return NextResponse.json({ error: 'Errore lettura clienti' }, { status: 500 });
    }

    const destinatari = clienti.map((c) => c.email).filter(Boolean);

    const corpoHtml = `
      <h2>🌟 Offerte del giorno da GR Gabriella Romeo</h2>
      <ul>
        ${prodotti.map((p) => `
          <li>
            <strong>${p.nome}</strong><br/>
            ${p.descrizione || ''}<br/>
            Prezzo: € ${p.prezzo?.toFixed(2)}<br/>
            ${p.sconto ? `<em>Sconto: ${p.sconto}%</em><br/>` : ''}
          </li>
        `).join('')}
      </ul>
      <p>Visita il nostro sito per vedere tutti i prodotti in offerta!</p>
    `;

    await sendEmail({
      to: destinatari,
      subject: '📣 Nuove Offerte G-R Gabriella Romeo',
      html: corpoHtml,
    });

    return NextResponse.json({ message: '✅ Email inviate correttamente!' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
