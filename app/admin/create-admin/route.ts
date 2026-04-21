import { NextResponse } from 'next/server';
import { requireAdmin } from '../../lib/serverAuth';
import { createServerSupabaseServiceClient } from '../../lib/serverSupabase';

export async function POST(req: Request) {
  try {
    const auth = await requireAdmin(req as any);
    if ((auth as any).error) return (auth as any).error;

    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });

    const s = createServerSupabaseServiceClient();

    const { error } = await s
      .from('admin_emails')
      .upsert({ email }, { onConflict: 'email' });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'error' }, { status: 500 });
  }
}
