import { jsonResponse, requireAdmin } from '../../lib/serverAuth';

export async function POST(request) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const formData = await request.formData();
  const file = formData.get('file');

  if (!file) {
    return jsonResponse({ error: 'Nessun file ricevuto' }, 400);
  }

  const fileName = `${Date.now()}_${file.name}`;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const { error } = await auth.service.storage
    .from('immagini') // nome bucket
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: true
    });

  if (error) {
    console.error('Upload error Supabase', error);
    return jsonResponse({ error: error.message }, 500);
  }

  return jsonResponse({ message: 'Upload riuscito', fileName }, 200);
}
