export const EURO = '\u20AC';

const supportedLangs = ['it', 'en', 'fr', 'de', 'es', 'ar', 'zh', 'ja'];

export function normalizeLang(lang) {
  return supportedLangs.includes(lang) ? lang : 'it';
}

export function parsePrice(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value !== 'string') return 0;

  const cleaned = value
    .trim()
    .replace(/[^\d,.-]/g, '')
    .replace(/\.(?=\d{3}(\D|$))/g, '')
    .replace(',', '.');

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function hasDisplayPrice(productOrPrice) {
  const value = typeof productOrPrice === 'object' && productOrPrice !== null
    ? productOrPrice.prezzo
    : productOrPrice;

  return parsePrice(value) > 0;
}

export function getBasePrice(product) {
  return parsePrice(product?.prezzo);
}

export function getDiscountPercent(product) {
  const parsed = Number(product?.sconto || 0);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function getFinalPrice(product) {
  const base = getBasePrice(product);
  const discount = getDiscountPercent(product);
  if (!product?.offerta || discount <= 0) return base;
  return Math.round((base - (base * discount / 100)) * 100) / 100;
}

export function formatEuro(value) {
  const parsed = parsePrice(value);
  return `${EURO} ${parsed.toLocaleString('it-IT', {
    useGrouping: true,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function isSoldOut(product) {
  const quantity = Number(product?.quantita);
  return Number.isFinite(quantity)
    && quantity <= 0
    && !product?.made_to_order
    && !product?.allow_backorder;
}

export const priceOnRequestText = {
  it: 'Prezzo su richiesta',
  en: 'Price on request',
  fr: 'Prix sur demande',
  de: 'Preis auf Anfrage',
  es: 'Precio bajo solicitud',
  ar: 'السعر عند الطلب',
  zh: '价格需咨询',
  ja: '価格はお問い合わせください',
};

export const requestPriceText = {
  it: 'Richiedi prezzo',
  en: 'Request price',
  fr: 'Demander le prix',
  de: 'Preis anfragen',
  es: 'Solicitar precio',
  ar: 'اطلب السعر',
  zh: '咨询价格',
  ja: '価格を問い合わせる',
};

export const addedToCartText = {
  it: 'Aggiunto al carrello',
  en: 'Added to cart',
  fr: 'Ajouté au panier',
  de: 'Zum Warenkorb hinzugefügt',
  es: 'Añadido al carrito',
  ar: 'تمت الإضافة إلى السلة',
  zh: '已加入购物车',
  ja: 'カートに追加しました',
};

export function getPriceOnRequestText(lang) {
  const safeLang = normalizeLang(lang);
  return priceOnRequestText[safeLang];
}

export function getRequestPriceText(lang) {
  const safeLang = normalizeLang(lang);
  return requestPriceText[safeLang];
}

export function getAddedToCartText(lang) {
  const safeLang = normalizeLang(lang);
  return addedToCartText[safeLang];
}

export function buildPriceRequestHref(product) {
  const productName = product?.nome_en || product?.nome || 'G-R Gabriella Romeo product';
  const subject = `Price request - ${productName}`;
  const body = [
    'Hello,',
    '',
    `I would like to receive price and ordering information for: ${productName}`,
    '',
    'Thank you.',
  ].join('\n');

  return `mailto:info@g-rgabriellaromeo.it?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
