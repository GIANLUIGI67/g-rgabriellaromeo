const supabaseProjectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

export function getPublicImageUrl(imagePath) {
  if (!imagePath) return '';
  const baseUrl = supabaseProjectUrl.replace(/\/+$/, '');
  const encodedPath = imagePath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  return `${baseUrl}/storage/v1/object/public/immagini/${encodedPath}`;
}
