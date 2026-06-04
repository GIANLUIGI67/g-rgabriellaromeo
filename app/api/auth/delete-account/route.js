export const runtime = 'nodejs';

import { jsonResponse, requireUser } from '../../../lib/serverAuth';
import { createServerSupabaseServiceClient } from '../../../lib/serverSupabase';

function normalizeEmail(value) {
  if (!value) return null;
  const normalized = String(value).trim().toLowerCase();
  return normalized || null;
}

function isOptionalDeleteError(error) {
  return error?.code === '42P01' || error?.code === '42703';
}

async function deleteOptionalRows(service, table, column, value) {
  if (!value) return;

  const { error } = await service
    .from(table)
    .delete()
    .eq(column, value);

  if (error && !isOptionalDeleteError(error)) throw error;
}

async function hasRows(query) {
  const { data, error } = await query.limit(1).maybeSingle();
  if (error && !isOptionalDeleteError(error)) throw error;
  return Boolean(data);
}

function hasOrderHistory(customer) {
  const orders = customer?.ordini;
  if (Array.isArray(orders)) return orders.length > 0;

  if (typeof orders === 'string') {
    try {
      const parsed = JSON.parse(orders);
      return Array.isArray(parsed) && parsed.length > 0;
    } catch {
      return false;
    }
  }

  return false;
}

async function hasCustomerOrderHistory(service, email) {
  if (!email) return false;

  const { data, error } = await service
    .from('clienti')
    .select('ordini')
    .eq('email', email)
    .maybeSingle();

  if (error && !isOptionalDeleteError(error)) throw error;
  return hasOrderHistory(data);
}

async function hasRelatedOrders(service, email) {
  if (!email) return false;

  const [hasConfirmedOrders, hasTemporaryOrders, hasProfileOrders] = await Promise.all([
    hasRows(
      service
        .from('ordini')
        .select('id')
        .eq('cliente->>email', email)
    ),
    hasRows(
      service
        .from('ordini_temporanei')
        .select('id')
        .eq('cliente_email', email)
    ),
    hasCustomerOrderHistory(service, email),
  ]);

  return hasConfirmedOrders || hasTemporaryOrders || hasProfileOrders;
}

async function deleteCustomerData(service, userId, email) {
  await deleteOptionalRows(service, 'clienti', 'user_id', userId);
  await deleteOptionalRows(service, 'clienti', 'email', email);
  await deleteOptionalRows(service, 'user_tracking', 'email', email);
}

export async function POST(request) {
  try {
    const auth = await requireUser(request);
    if (auth.error) return auth.error;

    const service = createServerSupabaseServiceClient();
    const email = normalizeEmail(auth.user.email);
    const retainDatabaseData = await hasRelatedOrders(service, email);

    if (!retainDatabaseData) {
      await deleteCustomerData(service, auth.user.id, email);
    }

    const { error: deleteUserError } = await service.auth.admin.deleteUser(auth.user.id);
    if (deleteUserError) throw deleteUserError;

    return jsonResponse({ ok: true, retainedData: retainDatabaseData });
  } catch (error) {
    return jsonResponse({ error: error?.message || 'Unable to delete account' }, 400);
  }
}
