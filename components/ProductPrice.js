'use client';

import {
  buildPriceRequestHref,
  formatEuro,
  getDiscountPercent,
  getFinalPrice,
  getPriceOnRequestText,
  getRequestPriceText,
  hasDisplayPrice,
} from '../app/lib/productDisplay';

export default function ProductPrice({ product, lang, className = '', style }) {
  const basePrice = product?.prezzo;
  const discount = getDiscountPercent(product);
  const finalPrice = getFinalPrice(product);

  if (!hasDisplayPrice(product)) {
    return (
      <p className={`${className} gr-price-request`.trim()} style={style}>
        <a
          href={buildPriceRequestHref(product, lang)}
          onClick={(event) => event.stopPropagation()}
          className="gr-price-request-link"
        >
          {getPriceOnRequestText(lang)}
          <span className="gr-price-request-separator"> · </span>
          {getRequestPriceText(lang)}
        </a>
      </p>
    );
  }

  return (
    <p className={className} style={style}>
      {product?.offerta && discount > 0 ? (
        <>
          <span className="gr-price-old">
            {formatEuro(basePrice)}
          </span>
          <span className="gr-price-sale">
            {formatEuro(finalPrice)} (-{discount}%)
          </span>
        </>
      ) : (
        <>{formatEuro(basePrice)}</>
      )}
    </p>
  );
}
