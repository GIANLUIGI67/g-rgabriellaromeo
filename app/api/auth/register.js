import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  const body = await req.json();
  const filePath = path.join(process.cwd(), 'public', 'data', 'clienti.json');

  let clienti = [];
  try {
    clienti = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    clienti = [];
  }

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
  fs.writeFileSync(filePath, JSON.stringify(clienti, null, 2));
  return new Response(JSON.stringify({ ok: true }), { status: 201 });
}
