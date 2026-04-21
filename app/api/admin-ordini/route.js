// app/api/admin-ordini/route.js
import { jsonResponse, requireAdmin } from '../../lib/serverAuth';

export async function GET(request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    const [ordRes, cliRes] = await Promise.all([
      auth.service.from('ordini').select('*').order('data', { ascending: false }),
      auth.service.from('clienti').select('id,nome,cognome,telefono1,telefono,mobile,phone,indirizzo,citta,cap,paese,email')
    ]);

    if (ordRes.error) {
      return jsonResponse({ ok: false, stage: 'ordini', error: ordRes.error.message }, 500);
    }
    if (cliRes.error) {
      return jsonResponse({ ok: false, stage: 'clienti', error: cliRes.error.message }, 500);
    }

    return jsonResponse({ ok: true, ordini: ordRes.data || [], clienti: cliRes.data || [] });
  } catch (e) {
    return jsonResponse({ ok: false, error: e.message }, 500);
  }
}
