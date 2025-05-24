import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(req) {
  const data = await req.formData();
  const file = data.get('file');

  if (!file) {
    return new Response('No file uploaded', { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filePath = path.join(process.cwd(), 'public', 'data', file.name);

  await writeFile(filePath, buffer);
  return new Response(JSON.stringify({ success: true }));
}
