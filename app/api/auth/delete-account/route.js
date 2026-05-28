export const runtime = 'nodejs';

import { jsonResponse, requireUser } from '../../../lib/serverAuth';
import { createServerSupabaseServiceClient } from '../../../lib/serverSupabase';

function normalizeEmail(value) {
  if (!value) return null;
  const normalized = String(value).trim().toLowerCase();
  return normalized || null;
}

async function deleteCustomerProfile(service, userId, email) {
  const { error: deleteByUserIdError } = await service
    .from('clienti')
    .delete()
    .eq('user_id', userId);

  if (deleteByUserIdError) throw deleteByUserIdError;

  if (!email) return;

  const { error: deleteByEmailError } = await service
    .from('clienti')
    .delete()
    .eq('email', email);

  if (deleteByEmailError) throw deleteByEmailError;
}

export async function POST(request) {
  try {
    const auth = await requireUser(request);
    if (auth.error) return auth.error;

    const service = createServerSupabaseServiceClient();
    const email = normalizeEmail(auth.user.email);

    await deleteCustomerProfile(service, auth.user.id, email);

    const { error: deleteUserError } = await service.auth.admin.deleteUser(auth.user.id);
    if (deleteUserError) throw deleteUserError;

    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ error: error?.message || 'Unable to delete account' }, 400);
  }
}
