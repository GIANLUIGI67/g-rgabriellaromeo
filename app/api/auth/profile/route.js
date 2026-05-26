export const runtime = 'nodejs';

import { jsonResponse, requireUser } from '../../../lib/serverAuth';
import { createServerSupabaseServiceClient } from '../../../lib/serverSupabase';

function normalize(value) {
  if (value === undefined || value === null) return null;
  const normalized = String(value).trim();
  return normalized === '' ? null : normalized;
}

function normalizeEmail(value) {
  const email = normalize(value);
  return email ? email.toLowerCase() : null;
}

function profileFields(body) {
  return {
    nome: normalize(body.nome),
    cognome: normalize(body.cognome),
    telefono1: normalize(body.telefono1),
    telefono2: normalize(body.telefono2),
    indirizzo: normalize(body.indirizzo),
    citta: normalize(body.citta),
    paese: normalize(body.paese),
    codice_postale: normalize(body.codice_postale),
  };
}

function mergeExistingProfile(existing, incoming) {
  const merged = {};
  for (const [key, value] of Object.entries(incoming)) {
    merged[key] = value ?? existing?.[key] ?? null;
  }
  return merged;
}

export async function POST(request) {
  try {
    const auth = await requireUser(request);
    if (auth.error) return auth.error;

    const body = await request.json().catch(() => ({}));
    const email = normalizeEmail(auth.user.email || body.email);
    if (!email) return jsonResponse({ error: 'Missing customer email' }, 400);

    const service = createServerSupabaseServiceClient();
    const incoming = profileFields(body);
    const now = new Date().toISOString();

    const { data: existing, error: existingError } = await service
      .from('clienti')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (existingError) throw existingError;

    const payload = {
      user_id: auth.user.id,
      email,
      ...mergeExistingProfile(existing, incoming),
      is_guest: false,
      updated_at: now,
    };

    let query;
    if (existing) {
      query = service
        .from('clienti')
        .update(payload)
        .eq('email', email)
        .select('*')
        .maybeSingle();
    } else {
      query = service
        .from('clienti')
        .insert([{
          ...payload,
          ordini: [],
          primo_sconto: 10,
          nuovo_sconto: null,
          created_at: now,
        }])
        .select('*')
        .maybeSingle();
    }

    const { data: customer, error } = await query;
    if (error) throw error;

    return jsonResponse({ ok: true, customer });
  } catch (error) {
    return jsonResponse({ error: error?.message || 'Unable to save customer profile' }, 400);
  }
}
