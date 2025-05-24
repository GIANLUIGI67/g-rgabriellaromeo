import { promises as fs } from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'public', 'data', 'ordini.json');

export async function POST(request) {
  try {
    const ordini = await request.json();
    await fs.writeFile(filePath, JSON.stringify(ordini, null, 2));
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500 });
  }
}
