import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  const body = await req.json();
  const filePath = path.join(process.cwd(), 'public', 'data', 'clienti.json');

  const clienti = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const utente = clienti.find(c => c.email === body.email);
  if (!utente) {
    return new Response(JSON.stringify({ error: 'Email non trovata' }), { status: 404 });
  }

  const valid = await bcrypt.compare(body.password, utente.password);
  if (!valid) {
    return new Response(JSON.stringify({ error: 'Password errata' }), { status: 401 });
  }

  return new Response(JSON.stringify({
    ok: true,
    utente: {
      id: utente.id,
      nome: utente.nome,
      email: utente.email
    }
  }), { status: 200 });
}
