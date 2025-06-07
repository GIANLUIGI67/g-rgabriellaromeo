import fs from 'fs/promises';
import path from 'path';

const filePath = path.join(process.cwd(), 'public', 'data', 'products.json');

export async function DELETE(request, { params }) {
  try {
    const id = params.id;
    const data = await fs.readFile(filePath, 'utf-8');
    const prodotti = JSON.parse(data);

    const aggiornato = prodotti.filter(p => String(p.id) !== String(id));

    await fs.writeFile(filePath, JSON.stringify(aggiornato, null, 2), 'utf-8');

    return new Response(JSON.stringify({ message: 'Prodotto eliminato' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Errore eliminazione:', err);
    return new Response(JSON.stringify({ error: 'Errore eliminazione' }), {
      status: 500
    });
  }
}
