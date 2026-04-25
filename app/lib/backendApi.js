function trimTrailingSlash(value) {
  return value.replace(/\/+$/, '');
}

function isLocalHostname(hostname) {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname.endsWith('.local')
  );
}

export function resolveBackendEndpoint(functionName, fallbackPath) {
  const functionsBase = process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL;
  if (!functionsBase) return fallbackPath;

  if (typeof window !== 'undefined' && isLocalHostname(window.location.hostname)) {
    return fallbackPath;
  }

  return `${trimTrailingSlash(functionsBase)}/${functionName}`;
}
