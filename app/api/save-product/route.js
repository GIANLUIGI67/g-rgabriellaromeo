import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const prodotti = await request.json();
    const filePath = path.join(process.cwd(), 'public', 'data', 'products.json');

    fs.writeFileSync(filePath, JSON.stringify(prodotti, null, 2));
    return new Response(JSON.stringify({ message: 'Prodotti salvati con successo!' }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Errore nel salvataggio dei prodotti' }), {
      status: 500,
    });
  }
}
