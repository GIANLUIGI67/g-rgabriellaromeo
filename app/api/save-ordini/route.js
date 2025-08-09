import { promises as fs } from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'public', 'data', 'ordini.json');

// Utility: legge JSON esistente o restituisce []
async function readJsonSafe(p) {
  try {
    const buf = await fs.readFile(p, 'utf8');
    return JSON.parse(buf || '[]');
  } catch {
    return [];
  }
}

export async function POST(request) {
  try {
    const ordine = await request.json();

    // Aggiungi metadati minimi se mancano
    const now = new Date().toISOString();
    const ordineConMeta = {
      id: ordine?.id || `ord_${Date.now()}`,
      created_at: ordine?.created_at || now,
      ...ordine,
    };

    // Leggi lista esistente e appendi
    const ordiniEsistenti = await readJsonSafe(filePath);
    ordiniEsistenti.push(ordineConMeta);

    await fs.writeFile(filePath, JSON.stringify(ordiniEsistenti, null, 2));

    return new Response(
      JSON.stringify({ ok: true, id: ordineConMeta.id, created_at: ordineConMeta.created_at }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500 });
  }
}
