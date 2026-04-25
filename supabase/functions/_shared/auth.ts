import { createAnonClient, createServiceClient } from './supabase.ts';
import { jsonResponse } from './cors.ts';

function getBearerToken(request: Request) {
  const header = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice('Bearer '.length).trim();
}

export async function requireUser(request: Request) {
  const accessToken = getBearerToken(request);
  if (!accessToken) {
    return { error: jsonResponse({ error: 'Missing bearer token' }, 401) };
  }

  const supabase = createAnonClient();
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data?.user) {
    return { error: jsonResponse({ error: 'Unauthorized' }, 401) };
  }

  return { user: data.user, accessToken };
}

export async function requireAdmin(request: Request) {
  const auth = await requireUser(request);
  if ('error' in auth) return auth;

  const service = createServiceClient();
  const { data, error } = await service
    .from('admin_emails')
    .select('email')
    .eq('email', auth.user.email)
    .maybeSingle();

  if (error || !data) {
    return { error: jsonResponse({ error: 'Forbidden' }, 403) };
  }

  return { ...auth, service };
}
