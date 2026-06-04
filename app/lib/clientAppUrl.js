import { getSiteUrl } from './siteUrl';

function trimTrailingSlash(value) {
  return String(value || '').replace(/\/+$/, '');
}

function isLocalHostname(hostname) {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname.endsWith('.local')
  );
}

function shouldUsePublicBase() {
  if (typeof window === 'undefined') return false;

  const { hostname, protocol } = window.location;
  if (protocol !== 'http:' && protocol !== 'https:') return true;

  return process.env.NODE_ENV === 'production' && isLocalHostname(hostname);
}

export function resolveClientAppUrl(path) {
  const normalizedPath = String(path || '/').startsWith('/') ? String(path || '/') : `/${path}`;

  if (!shouldUsePublicBase()) {
    return normalizedPath;
  }

  return `${trimTrailingSlash(getSiteUrl())}${normalizedPath}`;
}

export function resolveClientApiUrl(path) {
  return resolveClientAppUrl(path);
}

export function resolveClientAbsoluteAppUrl(path) {
  const normalizedPath = String(path || '/').startsWith('/') ? String(path || '/') : `/${path}`;

  if (typeof window !== 'undefined' && !shouldUsePublicBase()) {
    return new URL(normalizedPath, window.location.origin).href;
  }

  return new URL(normalizedPath, `${trimTrailingSlash(getSiteUrl())}/`).href;
}
