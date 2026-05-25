const DEFAULT_SITE_URL = 'https://g-rgabriellaromeo.vercel.app';

function normalizeSiteUrl(value) {
  try {
    const url = new URL(value || DEFAULT_SITE_URL);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      return DEFAULT_SITE_URL;
    }
    return url.href.replace(/\/+$/, '');
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export function getSiteUrl() {
  return normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
}

export function getSiteUrlForPath(path = '/') {
  const baseUrl = getSiteUrl();
  return new URL(path, `${baseUrl}/`).href;
}
