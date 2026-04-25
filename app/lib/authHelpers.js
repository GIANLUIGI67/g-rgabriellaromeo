const SIGNUP_RATE_LIMIT_REGEX = /For security purposes, you can only request this after (\d+) seconds?/i;

function cleanValue(value) {
  if (value === undefined || value === null) return null;
  const normalized = String(value).trim();
  return normalized === '' ? null : normalized;
}

export function buildCustomerSignupMetadata(profile) {
  return {
    nome: cleanValue(profile.nome),
    cognome: cleanValue(profile.cognome),
    telefono1: cleanValue(profile.telefono1),
    telefono2: cleanValue(profile.telefono2),
    indirizzo: cleanValue(profile.indirizzo),
    citta: cleanValue(profile.citta),
    paese: cleanValue(profile.paese),
    codice_postale: cleanValue(profile.codicePostale),
    primo_sconto: '10',
  };
}

export function getReadableAuthErrorMessage(error, fallbackMessage = 'Errore durante l\'autenticazione') {
  const rawMessage = error?.message || '';
  const rateLimitMatch = rawMessage.match(SIGNUP_RATE_LIMIT_REGEX);

  if (rateLimitMatch) {
    return `Troppi tentativi ravvicinati. Attendi ${rateLimitMatch[1]} secondi e riprova una sola volta.`;
  }

  if (/email rate limit exceeded/i.test(rawMessage)) {
    return 'Troppi tentativi ravvicinati su questa email. Attendi circa 60 secondi e riprova una sola volta.';
  }

  if (/user already registered/i.test(rawMessage)) {
    return 'Esiste gia un account con questa email. Accedi oppure usa il recupero password.';
  }

  if (/email not confirmed/i.test(rawMessage)) {
    return 'Controlla la tua email e conferma l\'account prima di accedere.';
  }

  if (/invalid login credentials/i.test(rawMessage)) {
    return 'Credenziali non valide.';
  }

  return rawMessage || fallbackMessage;
}

export async function registerCustomerWithBackend(payload) {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error || 'Errore durante la registrazione');
  }

  return data;
}
