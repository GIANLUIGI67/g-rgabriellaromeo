import { readFile } from 'fs/promises';
import path from 'path';

export async function GET() {
  const filePath = path.join(process.cwd(), 'public', 'data', 'products.json');
  try {
    const fileData = await readFile(filePath, 'utf-8');
    const prodotti = JSON.parse(fileData);
    return new Response(JSON.stringify(prodotti), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Errore nella lettura di products.json:', error);
    return new Response(JSON.stringify([]), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  }
}
