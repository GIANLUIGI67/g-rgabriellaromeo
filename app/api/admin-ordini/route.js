// app/api/admin-ordini/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // SOLO lato server

const sb = createClient(url, serviceKey, { auth: { persistSession: false } });

export async function GET() {
  try {
    const [ordRes, cliRes] = await Promise.all([
      sb.from('ordini').select('*').order('data', { ascending: false }),
      sb.from('clienti').select('id,nome,cognome,telefono1,telefono,mobile,phone,indirizzo,citta,cap,paese,email')
    ]);

    if (ordRes.error) {
      return NextResponse.json({ ok: false, stage: 'ordini', error: ordRes.error.message }, { status: 500 });
    }
    if (cliRes.error) {
      return NextResponse.json({ ok: false, stage: 'clienti', error: cliRes.error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, ordini: ordRes.data || [], clienti: cliRes.data || [] });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
