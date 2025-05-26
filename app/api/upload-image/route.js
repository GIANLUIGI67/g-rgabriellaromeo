import { supabase } from '../../lib/supabaseClient';

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get('file');

  if (!file) {
    return new Response(JSON.stringify({ error: 'Nessun file ricevuto' }), { status: 400 });
  }

  const fileName = `${Date.now()}_${file.name}`;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const { error } = await supabase.storage
    .from('immagini') // nome bucket
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: true
    });

  if (error) {
    console.error('Upload error Supabase', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ message: 'Upload riuscito', fileName }), { status: 200 });
}
