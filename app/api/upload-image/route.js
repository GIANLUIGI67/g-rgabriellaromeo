import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get('file');

  if (!file) {
    return new Response(JSON.stringify({ error: 'Nessun file ricevuto' }), {
      status: 400,
    });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filePath = path.join(process.cwd(), 'public', 'uploads', file.name);

  await writeFile(filePath, buffer);

  return new Response(JSON.stringify({ message: 'Immagine caricata' }), {
    status: 200,
  });
}
