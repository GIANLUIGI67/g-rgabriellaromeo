import { createServerSupabaseServiceClient } from '../../lib/serverSupabase';
import { jsonResponse } from '../../lib/serverAuth';
import { sendEmail } from '../../lib/mailer';

export async function POST(request) {
  const { email } = await request.json().catch(() => ({}));
  if (!email) return jsonResponse({ error: 'Email mancante' }, 400);

  const service = createServerSupabaseServiceClient();

  const { data: adminRow } = await service
    .from('admin_emails')
    .select('email')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle();

  if (!adminRow) return jsonResponse({ error: 'Email non trovata tra gli admin' }, 404);

  const { data: linkData, error: linkError } = await service.auth.admin.generateLink({
    type: 'recovery',
    email: email.trim(),
    options: {
      redirectTo: 'https://g-rgabriellaromeo.vercel.app/admin/reset-password',
    },
  });

  if (linkError || !linkData?.properties?.action_link) {
    return jsonResponse({ error: linkError?.message || 'Impossibile generare il link' }, 500);
  }

  const resetLink = linkData.properties.action_link;

  try {
    await sendEmail({
      to: email.trim(),
      subject: 'Reset password — G-R Gabriella Romeo Admin',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;background:#fff;">
          <h2 style="color:#111;">Reset password pannello admin</h2>
          <p>Clicca il pulsante qui sotto per impostare una nuova password.</p>
          <p>Il link è valido per <strong>1 ora</strong>.</p>
          <a href="${resetLink}"
             style="display:inline-block;margin-top:16px;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">
            Reimposta password
          </a>
          <p style="margin-top:24px;font-size:12px;color:#666;">
            Se non hai richiesto questo reset, ignora questa email.
          </p>
        </div>
      `,
    });
  } catch (e) {
    return jsonResponse({ error: 'Errore invio email: ' + e.message }, 500);
  }

  return jsonResponse({ ok: true });
}
