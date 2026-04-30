import { jsonResponse, requireAdmin } from '../../lib/serverAuth';

export async function GET(request) {
  const auth = await requireAdmin(request);
  if (auth.error) return jsonResponse({ isAdmin: false }, 200);
  return jsonResponse({ isAdmin: true }, 200);
}
