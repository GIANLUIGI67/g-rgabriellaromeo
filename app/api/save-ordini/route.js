import { readJsonFile, writeJsonFile } from '../../lib/serverData';

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
    const ordiniEsistenti = await readJsonFile('ordini.json', []);
    ordiniEsistenti.push(ordineConMeta);
    await writeJsonFile('ordini.json', ordiniEsistenti);

    return new Response(
      JSON.stringify({ ok: true, id: ordineConMeta.id, created_at: ordineConMeta.created_at }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500 });
  }
}
