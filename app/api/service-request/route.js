export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { sendEmail } from '../../lib/mailer';

const requestRecipient = process.env.SERVICE_REQUEST_TO || 'info@g-rgabriellaromeo.it';

function clean(value) {
  return String(value || '').trim().slice(0, 1200);
}

function escapeHtml(value) {
  return clean(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function POST(request) {
  try {
    const body = await request.json();
    const name = clean(body.name);
    const email = clean(body.email).toLowerCase();
    const phone = clean(body.phone);
    const service = clean(body.service);
    const occasion = clean(body.occasion);
    const budget = clean(body.budget);
    const preferredDate = clean(body.preferredDate);
    const contactMethod = clean(body.contactMethod);
    const notes = clean(body.notes);
    const lang = clean(body.lang || 'it');

    if (!name || !email || !service || !occasion || !contactMethod) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await sendEmail({
      to: requestRecipient,
      subject: `G-R style request - ${service}`,
      html: `
        <h2>Nuova richiesta servizi G-R</h2>
        <p><strong>Nome:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Telefono:</strong> ${escapeHtml(phone)}</p>
        <p><strong>Servizio:</strong> ${escapeHtml(service)}</p>
        <p><strong>Occasione:</strong> ${escapeHtml(occasion)}</p>
        <p><strong>Budget:</strong> ${escapeHtml(budget)}</p>
        <p><strong>Data preferita:</strong> ${escapeHtml(preferredDate)}</p>
        <p><strong>Contatto preferito:</strong> ${escapeHtml(contactMethod)}</p>
        <p><strong>Lingua:</strong> ${escapeHtml(lang)}</p>
        <p><strong>Note:</strong><br>${escapeHtml(notes).replace(/\n/g, '<br>')}</p>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error?.message || 'Unable to send request' }, { status: 500 });
  }
}
