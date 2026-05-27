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

function shouldUseSupabaseFunctions() {
  return process.env.NEXT_PUBLIC_BACKEND_API_PROVIDER === 'supabase-functions';
}

export function resolveBackendEndpoint(functionName, fallbackPath) {
  // Checkout/payment endpoints are guaranteed on Next.js API routes and
  // must stay same-origin to avoid CORS/preflight failures in production.
  if ([
    'checkout-quote',
    'checkout-reserve',
    'checkout-finalize',
    'payment-intent',
  ].includes(functionName)) {
    return fallbackPath;
  }

  const functionsBase = process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL;
  if (!functionsBase || !shouldUseSupabaseFunctions()) return fallbackPath;

  if (typeof window !== 'undefined' && isLocalHostname(window.location.hostname)) {
    return fallbackPath;
  }

  return `${trimTrailingSlash(functionsBase)}/${functionName}`;
}
