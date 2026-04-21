import bcrypt from 'bcryptjs';
import { readJsonFile } from '../../lib/serverData';

export async function POST(req) {
  const body = await req.json();
  const clienti = await readJsonFile('clienti.json', []);
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
