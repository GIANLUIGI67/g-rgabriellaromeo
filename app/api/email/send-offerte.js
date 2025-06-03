import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabase } from '../../../lib/supabaseClient';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const { prodotti } = await req.json();

    if (!prodotti || prodotti.length === 0) {
      return NextResponse.json({ error: 'Nessun prodotto selezionato' }, { status: 400 });
    }

    // Recupera tutti i clienti registrati
    const { data: clienti, error: clientiError } = await supabase
      .from('clienti')
      .select('email');

    if (clientiError) {
      console.error('Errore lettura clienti:', clientiError.message);
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

    const result = await resend.emails.send({
      from: 'info@g-rgabriellaromeo.it',
      to: destinatari,
      subject: '📣 Nuove Offerte G-R Gabriella Romeo',
      html: corpoHtml,
    });

    return NextResponse.json({ message: '✅ Email inviate correttamente!', result });
  } catch (error) {
    console.error('Errore invio email:', error);
    return NextResponse.json({ error: 'Errore durante invio email' }, { status: 500 });
  }
}
