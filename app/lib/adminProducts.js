const PRODUCT_FIELDS = new Set([
  'categoria',
  'sottocategoria',
  'nome',
  'descrizione',
  'taglia',
  'prezzo',
  'quantita',
  'immagine',
  'disponibile',
  'offerta',
  'sconto',
  'emailOfferta',
  'made_to_order',
  'allow_backorder',
  'created_at',
  'updated_at',
]);

function cleanString(value) {
  if (value === undefined || value === null) return null;
  const normalized = String(value).trim();
  return normalized === '' ? null : normalized;
}

function cleanBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  return value === true || value === 'true' || value === 1 || value === '1';
}

function cleanNonNegativeNumber(value, field) {
  const parsed = Number(value ?? 0);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${field} must be a non-negative number`);
  }
  return parsed;
}

function cleanNonNegativeInteger(value, field) {
  const parsed = Number(value ?? 0);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${field} must be a non-negative integer`);
  }
  return parsed;
}

export function sanitizeProductPayload(input, { creating = false } = {}) {
  const payload = {};
  for (const [key, value] of Object.entries(input || {})) {
    if (PRODUCT_FIELDS.has(key)) payload[key] = value;
  }

  payload.nome = cleanString(payload.nome);
  payload.categoria = cleanString(payload.categoria);
  payload.sottocategoria = cleanString(payload.sottocategoria);
  payload.descrizione = cleanString(payload.descrizione);
  payload.taglia = cleanString(payload.taglia);
  payload.immagine = cleanString(payload.immagine);
  payload.prezzo = cleanNonNegativeNumber(payload.prezzo, 'prezzo');
  payload.quantita = cleanNonNegativeInteger(payload.quantita, 'quantita');
  payload.disponibile = cleanBoolean(payload.disponibile, true);
  payload.offerta = cleanBoolean(payload.offerta, false);
  payload.emailOfferta = cleanBoolean(payload.emailOfferta, false);
  payload.sconto = payload.offerta ? cleanNonNegativeNumber(payload.sconto, 'sconto') : 0;
  payload.made_to_order = cleanBoolean(payload.made_to_order, payload.quantita === 0);
  payload.allow_backorder = cleanBoolean(payload.allow_backorder, payload.quantita === 0);
  payload.updated_at = new Date().toISOString();

  if (creating) payload.created_at = cleanString(payload.created_at) || payload.updated_at;
  if (!payload.nome) throw new Error('nome is required');
  if (!payload.categoria) throw new Error('categoria is required');

  return payload;
}
