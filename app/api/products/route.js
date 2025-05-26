import fs from 'fs/promises';
import path from 'path';

const filePath = path.join(process.cwd(), 'public', 'data', 'products.json');

export async function GET() {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return new Response(data, {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Errore lettura file:', err);
    return new Response(JSON.stringify([]), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  }
}

export async function POST(req) {
  try {
    const nuovoProdotto = await req.json();
    const data = await fs.readFile(filePath, 'utf-8');
    const prodotti = JSON.parse(data);

    const index = prodotti.findIndex(p => p.id === nuovoProdotto.id);
    if (index !== -1) {
      prodotti[index] = nuovoProdotto; // MODIFICA
    } else {
      prodotti.push(nuovoProdotto); // AGGIUNTA
    }

    await fs.writeFile(filePath, JSON.stringify(prodotti, null, 2), 'utf-8');
    return new Response(JSON.stringify(nuovoProdotto), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Errore salvataggio:', err);
    return new Response(JSON.stringify({ error: 'Errore salvataggio' }), {
      status: 500
    });
  }
}
