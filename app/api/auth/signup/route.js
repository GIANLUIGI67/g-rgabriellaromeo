export const runtime = 'nodejs';

import { jsonResponse } from '../../../lib/serverAuth';
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

function buildMetadata(body) {
  return {
    nome: normalize(body.nome),
    cognome: normalize(body.cognome),
    telefono1: normalize(body.telefono1),
    telefono2: normalize(body.telefono2),
    indirizzo: normalize(body.indirizzo),
    citta: normalize(body.citta),
    paese: normalize(body.paese),
    codice_postale: normalize(body.codice_postale),
    primo_sconto: '10',
  };
}

async function findUserByEmail(admin, email) {
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await admin.listUsers({ page, perPage });
    if (error) throw error;

    const users = data?.users || [];
    const found = users.find((user) => user.email?.toLowerCase() === email);
    if (found) return found;

    if (users.length < perPage) return null;
    page += 1;
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(body.email);
    const password = body.password;

    if (!email || !password) {
      return jsonResponse({ error: 'Inserisci email e password' }, 400);
    }

    if (String(password).length < 8) {
      return jsonResponse({ error: 'La password deve contenere almeno 8 caratteri.' }, 400);
    }

    const service = createServerSupabaseServiceClient();
    const admin = service.auth.admin;
    const metadata = buildMetadata(body);

    const existingUser = await findUserByEmail(admin, email);
    if (existingUser) {
      return jsonResponse(
        { error: 'Esiste gia un account con questa email. Accedi oppure usa Password dimenticata.' },
        409
      );
    }

    const { data: created, error: createError } = await admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: metadata,
    });

    if (createError || !created?.user) {
      return jsonResponse({ error: createError?.message || 'Errore durante la creazione account' }, 400);
    }

    const profilePayload = {
      user_id: created.user.id,
      email,
      nome: metadata.nome,
      cognome: metadata.cognome,
      telefono1: metadata.telefono1,
      telefono2: metadata.telefono2,
      indirizzo: metadata.indirizzo,
      citta: metadata.citta,
      paese: metadata.paese,
      codice_postale: metadata.codice_postale,
      ordini: [],
      primo_sconto: 10,
      nuovo_sconto: null,
      is_guest: false,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedProfile, error: updateProfileError } = await service
      .from('clienti')
      .update(profilePayload)
      .eq('email', email)
      .select('id')
      .maybeSingle();

    const { error: profileError } =
      updateProfileError || updatedProfile
        ? { error: updateProfileError }
        : await service.from('clienti').insert([profilePayload]);

    if (profileError) {
      await admin.deleteUser(created.user.id);
      return jsonResponse({ error: profileError.message || 'Errore durante il salvataggio profilo' }, 400);
    }

    return jsonResponse({
      ok: true,
      userId: created.user.id,
      email,
    });
  } catch (error) {
    return jsonResponse({ error: error?.message || 'Errore durante la registrazione' }, 500);
  }
}
