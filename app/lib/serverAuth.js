import { createServerSupabaseAnonClient, createServerSupabaseServiceClient } from './serverSupabase';

export function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function getBearerToken(request) {
  const header = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice('Bearer '.length).trim();
}

export async function requireUser(request) {
  const accessToken = getBearerToken(request);
  if (!accessToken) {
    return { error: jsonResponse({ error: 'Missing bearer token' }, 401) };
  }

  const supabase = createServerSupabaseAnonClient();
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data?.user) {
    return { error: jsonResponse({ error: 'Unauthorized' }, 401) };
  }

  return { user: data.user, accessToken };
}

export async function requireAdmin(request) {
  const auth = await requireUser(request);
  if (auth.error) return auth;

  const service = createServerSupabaseServiceClient();
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
