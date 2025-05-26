import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get('file');

  if (!file || typeof file.name !== 'string') {
    return new Response(JSON.stringify({ error: 'Nessun file valido ricevuto' }), {
      status: 400,
    });
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

    // Crea la cartella uploads se non esiste
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, file.name);
    await writeFile(filePath, buffer);

    return new Response(JSON.stringify({ message: 'Immagine caricata', fileName: file.name }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Errore salvataggio file:', error);
    return new Response(JSON.stringify({ error: 'Errore nel salvataggio immagine' }), {
      status: 500,
    });
  }
}
