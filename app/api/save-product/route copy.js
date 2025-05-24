import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(req) {
  const prodotti = await req.json();
  const filePath = path.join(process.cwd(), 'public', 'data', 'products.json');
  await writeFile(filePath, JSON.stringify(prodotti, null, 2));
  return new Response(JSON.stringify({ success: true }));
}
