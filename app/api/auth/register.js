import bcrypt from 'bcryptjs';
import { readJsonFile, writeJsonFile } from '../../lib/serverData';

export async function POST(req) {
  const body = await req.json();
  const clienti = await readJsonFile('clienti.json', []);

  const esiste = clienti.find(c => c.email === body.email);
  if (esiste) {
    return new Response(JSON.stringify({ error: 'Utente già registrato' }), { status: 400 });
  }

  const hash = await bcrypt.hash(body.password, 10);

  const nuovo = {
    id: `c${Date.now()}`,
    nome: body.nome || '',
    email: body.email,
    password: hash,
    ordini: [],
    feedback: [],
    data_registrazione: new Date().toISOString()
  };

  clienti.push(nuovo);
  await writeJsonFile('clienti.json', clienti);
  return new Response(JSON.stringify({ ok: true }), { status: 201 });
}
