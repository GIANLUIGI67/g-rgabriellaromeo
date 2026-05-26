'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ShoppingCart } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { addProductToCart, getCartItemCount, loadCartFromStorage, removeProductFromCart, saveCartToStorage } from '../lib/cart';
import { getPublicImageUrl } from '../lib/storageUrl';
import { Suspense } from 'react';
import ProductPrice from '../../components/ProductPrice';
import ProductionPolicyDialog from '../../components/ProductionPolicyDialog';
import {
  buildPriceRequestHref,
  getAddedToCartText,
  getRequestPriceText,
  hasDisplayPrice,
  isSoldOut,
  requiresProductionPolicy,
} from '../lib/productDisplay';

function AccessoriPage() {
  const params = useSearchParams();
  const lang = params.get('lang') || 'it';
  const router = useRouter();

  const [prodotti, setProdotti] = useState([]);
  const [quantita, setQuantita] = useState({});
  const [sottocategoriaSelezionata, setSottocategoriaSelezionata] = useState('');
  const [carrello, setCarrello] = useState([]);
  const [popupProdotto, setPopupProdotto] = useState(null);
  const [immagineAttiva, setImmagineAttiva] = useState('');
  const [pendingProductionItem, setPendingProductionItem] = useState(null);
  const [cartNotice, setCartNotice] = useState('');
  
  const traduzioni = {
    it: {
      titolo: 'GALLERIA ACCESSORI',
      sottotutte: 'Tutte le sottocategorie',
      aggiungi: 'Aggiungi al carrello',
      checkout: 'Check-out',
      indietro: 'Indietro',
      venduto: 'ESAURITO',  // Modificato in versione compatta
      erroreQuantita: 'Prodotto esaurito!',  // Messaggio semplificato
      visualizzaPolicy: 'Visualizza Policy',
      accetta: 'Sono d\'accordo con la policy per la produzione',
      continua: 'Continua con l\'ordine',
      rimuovi: 'Rimuovi',
      carrello: 'Carrello',
      policyTitolo: 'Policy per la produzione'
    },
    en: {
      titolo: 'ACCESSORY GALLERY',
      sottotutte: 'All subcategories',
      aggiungi: 'Add to cart',
      checkout: 'Checkout',
      indietro: 'Back',
      venduto: 'SOLD',  // Modificato in versione compatta
      erroreQuantita: 'Product out of stock!',  // Messaggio semplificato
      visualizzaPolicy: 'View Policy',
      accetta: 'I agree with the production policy',
      continua: 'Continue with order',
      rimuovi: 'Remove',
      carrello: 'Cart',
      policyTitolo: 'Production Policy'
    },
    fr: {
      titolo: 'GALERIE ACCESSOIRES',
      sottotutte: 'Toutes les sous-catégories',
      aggiungi: 'Ajouter au panier',
      checkout: 'Passer à la caisse',
      indietro: 'Retour',
      venduto: 'ÉPUISÉ',  // Versione compatta
      erroreQuantita: 'Produit en rupture de stock!',  // Messaggio semplificato
      visualizzaPolicy: 'Voir la politique',
      accetta: 'J\'accepte la politique de production',
      continua: 'Continuer la commande',
      rimuovi: 'Supprimer',
      carrello: 'Panier',
      policyTitolo: 'Politique de production'
    },
    de: {
      titolo: 'ACCESSOIRES GALERIE',
      sottotutte: 'Alle Unterkategorien',
      aggiungi: 'In den Warenkorb',
      checkout: 'Zur Kasse',
      indietro: 'Zurück',
      venduto: 'AUSVERKAUFT',  // Versione molto più corta
      erroreQuantita: 'Produkt ausverkauft!',  // Messaggio semplificato
      visualizzaPolicy: 'Richtlinie anzeigen',
      accetta: 'Ich stimme der Produktionsrichtlinie zu',
      continua: 'Bestellung fortsetzen',
      rimuovi: 'Entfernen',
      carrello: 'Warenkorb',
      policyTitolo: 'Produktionsrichtlinie'
    },
    es: {
      titolo: 'GALERÍA DE ACCESORIOS',
      sottotutte: 'Todas las subcategorías',
      aggiungi: 'Agregar al carrito',
      checkout: 'Finalizar compra',
      indietro: 'Atrás',
      venduto: 'AGOTADO',  // Versione compatta
      erroreQuantita: '¡Producto agotado!',  // Messaggio semplificato
      visualizzaPolicy: 'Ver política',
      accetta: 'Acepto la política de producción',
      continua: 'Continuar pedido',
      rimuovi: 'Eliminar',
      carrello: 'Carrito',
      policyTitolo: 'Política de producción'
    },
    zh: {
      titolo: '配饰画廊',
      sottotutte: '所有子类别',
      aggiungi: '添加到购物车',
      checkout: '结账',
      indietro: '返回',
      venduto: '售罄',  // Versione compatta
      erroreQuantita: '产品缺货!',  // Messaggio semplificato
      visualizzaPolicy: '查看政策',
      accetta: '我同意生产政策',
      continua: '继续下单',
      rimuovi: '移除',
      carrello: '购物车',
      policyTitolo: '生产政策'
    },
    ar: {
      titolo: 'معرض الإكسسوارات',
      sottotutte: 'كل الفئات الفرعية',
      aggiungi: 'أضف إلى السلة',
      checkout: 'إتمام الشراء',
      indietro: 'رجوع',
      venduto: 'نفذ',  // Forma abbreviata
      erroreQuantita: 'المنتج غير متوفر!',  // Messaggio semplificato
      visualizzaPolicy: 'عرض السياسة',
      accetta: 'أوافق على سياسة الإنتاج',
      continua: 'متابعة الطلب',
      rimuovi: 'إزالة',
      carrello: 'عربة التسوق',
      policyTitolo: 'سياسة الإنتاج'
    },
    ja: {
      titolo: 'アクセサリーギャラリー',
      sottotutte: 'すべてのサブカテゴリ',
      aggiungi: 'カートに追加',
      checkout: 'チェックアウト',
      indietro: '戻る',
      venduto: '売切',  // Versione compatta
      erroreQuantita: '在庫切れ!',  // Messaggio semplificato
      visualizzaPolicy: 'ポリシーを見る',
      accetta: '生産ポリシーに同意します',
      continua: '注文を続ける',
      rimuovi: '削除',
      carrello: 'カート',
      policyTitolo: '生産ポリシー'
    }
  };

  const t = (key) => traduzioni[lang]?.[key] || traduzioni['it'][key] || key;

  const sottocategorie = {
    collane: { it: 'Collane', en: 'Necklaces', fr: 'Colliers', de: 'Ketten', es: 'Collares', zh: '项链', ar: 'قلائد', ja: 'ネックレス' },
    orecchini: { it: 'Orecchini', en: 'Earrings', fr: 'Boucles d’oreilles', de: 'Ohrringe', es: 'Pendientes', zh: '耳环', ar: 'أقراط', ja: 'イヤリング' },
    bracciali: { it: 'Bracciali', en: 'Bracelets', fr: 'Bracelets', de: 'Armbänder', es: 'Pulseras', zh: '手镯', ar: 'أساور', ja: 'ブレスレット' },
    borse: { it: 'Borse', en: 'Bags', fr: 'Sacs', de: 'Taschen', es: 'Bolsos', zh: '包', ar: 'حقائب', ja: 'バッグ' },
    foulard: { it: 'Foulard', en: 'Scarves', fr: 'Foulards', de: 'Schals', es: 'Pañuelos', zh: '围巾', ar: 'أوشحة', ja: 'スカーフ' }
  };
  
  useEffect(() => {
    setCarrello(loadCartFromStorage());

    const fetchProdotti = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('categoria', 'accessori')
        .order('created_at', { ascending: false });

      if (!error) {
        setProdotti(data);
        const iniziali = {};
        data.forEach(p => { iniziali[p.id] = 1; });
        setQuantita(iniziali);
      }
    };
    fetchProdotti();
  }, []);

  const filtrati = prodotti.filter(p =>
    !sottocategoriaSelezionata || p.sottocategoria === sottocategoriaSelezionata
  );

  const cambiaQuantita = (id, delta) => {
    setQuantita(prev => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + delta)
    }));
  };

  const aggiungiProdottoAlCarrello = (prodotto, qta) => {
    const nuovoCarrello = addProductToCart(carrello, prodotto, qta);
    setCarrello(nuovoCarrello);
    saveCartToStorage(nuovoCarrello);
    setCartNotice(getAddedToCartText(lang));
    window.setTimeout(() => setCartNotice(''), 2200);
    return true;
  };

  const aggiungiAlCarrello = (prodotto) => {
    if (!hasDisplayPrice(prodotto)) return false;

    const qta = quantita[prodotto.id] || 1;
    if (requiresProductionPolicy(prodotto, qta)) {
      setPendingProductionItem({ prodotto, qta });
      return false;
    }

    return aggiungiProdottoAlCarrello(prodotto, qta);
  };

  const rimuoviDalCarrello = (prodottoId) => {
    const nuovoCarrello = removeProductFromCart(carrello, prodottoId);
    setCarrello(nuovoCarrello);
    saveCartToStorage(nuovoCarrello);
  };

  const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/immagini/`;
  
  return (
    <main className="gr-gallery-page" style={{ backgroundColor: 'black', color: 'white', padding: '2rem 1rem', maxWidth: '100vw', overflowX: 'hidden', margin: '0 auto', position: 'relative' }}>
      <button
        type="button"
        className="gr-gallery-back"
        onClick={() => router.push(`/?lang=${lang}`)}
        aria-label={t('indietro')}
      >
        <ChevronLeft aria-hidden="true" />
      </button>

      {getCartItemCount(carrello) > 0 && (
        <div
          onClick={() => router.push(`/checkout?lang=${lang}`)}
          style={{
            position: 'fixed',
            top: '0.5rem',
            left: '0.5rem',
            background: 'none',
            color: 'white',
            padding: '0.4rem 0.6rem',
            fontSize: '0.75rem',
            fontFamily: 'Michroma, sans-serif',
            zIndex: 10000,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            border: 'none',
            outline: 'none',
            boxShadow: 'none',
            WebkitBoxShadow: 'none',
            MozBoxShadow: 'none',
            borderRadius: 0
          }}
        >
          <ShoppingCart size={16} strokeWidth={1.5} color="white" />
          <span style={{ lineHeight: 1 }}>{t('checkout')}</span>
        </div>
      )}

      <h1 className="gr-gallery-heading" style={{
        fontSize: 'clamp(1.5rem, 5vw, 2rem)',
        textAlign: 'center',
        marginBottom: '2rem',
        wordBreak: 'break-word',
        overflowWrap: 'break-word'
      }}>
        {t('titolo')}
      </h1>

      <div className="gr-subcategory-wrap" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <select
          className="gr-subcategory-select"
          value={sottocategoriaSelezionata}
          onChange={e => setSottocategoriaSelezionata(e.target.value)}
          style={{
            minWidth: '250px',
            padding: '0.5rem',
            fontSize: '1rem',
            backgroundColor: '#000',
            color: '#fff',
            border: '1px solid #fff',
            borderRadius: '6px'
          }}
        >
          <option value="">{t('sottotutte')}</option>
          {Object.entries(sottocategorie).map(([key, trad]) => (
            <option key={key} value={key}>
              {trad[lang] || trad.it}
            </option>
          ))}
        </select>
      </div>
      
      <div className="gr-product-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: '1.5rem'
      }}>
        {filtrati.map(prodotto => {
          const esaurito = isSoldOut(prodotto);
          
          return (
            <div key={prodotto.id} className="gr-product-card" style={{
              backgroundColor: 'white',
              color: 'black',
              padding: '0.5rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '340px',
              position: 'relative'
            }}>
              {esaurito && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: 'rgba(255, 0, 0, 0.7)',
                  color: 'white',
                  padding: '0.3rem 0.4rem',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  fontSize: '0.75rem',
                  zIndex: 2,
                  width: 'auto',
                  maxWidth: '90%',
                  textAlign: 'center',
                  whiteSpace: 'nowrap'
                }}>
                  {t('venduto')}
                </div>
              )}
              
              <img
                className="gr-product-image"
                src={baseUrl + prodotto.immagine}
                alt={prodotto.nome}
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  cursor: esaurito ? 'default' : 'pointer',
                  borderRadius: '4px',
                  opacity: esaurito ? 0.5 : 1
                }}
                onClick={() => {
                  if (!esaurito) {
                    setPopupProdotto(prodotto);
                    setImmagineAttiva(prodotto.immagine);
                  }
                }}
              />
              
              <div className="gr-product-info" style={{
                padding: '0.5rem 0',
                minHeight: '60px'
              }}>
                <strong className="gr-product-title" style={{
                  display: 'block',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  marginBottom: '0.3rem',
                  minHeight: '2.2em',
                  lineHeight: '1.1em',
                  overflow: 'hidden'
                }}>
                  {prodotto.nome}
                </strong>
                <p className="gr-product-meta" style={{
                  fontSize: '0.8rem',
                  color: '#555',
                  marginBottom: '0.3rem'
                }}>{prodotto.taglia}</p>
                <ProductPrice product={prodotto} lang={lang} className="gr-product-price gr-price" />
              </div>
            </div>
          );
        })}
      </div>
      
      {popupProdotto && (
        <div
          className="gr-product-modal-overlay"
          onClick={() => {
            setPopupProdotto(null);
            setImmagineAttiva('');
          }}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.9)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            overflowY: 'auto'
          }}
        >
          <div
            className="gr-product-modal"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '600px',
              width: '100%',
              backgroundColor: 'white',
              color: 'black',
              borderRadius: '10px',
              padding: '1rem',
              textAlign: 'center',
              position: 'relative'
            }}
          >
            <button
              className="gr-product-modal-close"
              onClick={(e) => {
                e.stopPropagation();
                setPopupProdotto(null);
                setImmagineAttiva('');
              }}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'none',
                border: 'none',
                fontSize: '1.2rem',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>

            <img
              className="gr-product-modal-image"
              src={getPublicImageUrl(immagineAttiva)}
              alt="zoom"
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '6px',
                marginBottom: '1rem'
              }}
            />

            <h2 className="gr-product-modal-title" style={{ marginBottom: '0.5rem' }}>{popupProdotto.nome}</h2>
            <p className="gr-product-modal-description" style={{ fontSize: '0.9rem' }}>{popupProdotto.descrizione}</p>
            <p className="gr-product-modal-meta" style={{ fontSize: '0.9rem', margin: '0.5rem 0' }}>{popupProdotto.taglia}</p>

            <ProductPrice
              product={popupProdotto}
              lang={lang}
              className="gr-product-modal-price gr-price"
              style={{ fontWeight: 'bold', fontSize: '1rem', margin: '1rem 0' }}
            />
            
            {hasDisplayPrice(popupProdotto) ? (
              <>
                <div className="gr-product-modal-quantity" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button onClick={() => cambiaQuantita(popupProdotto.id, -1)} style={{ fontSize: '1.2rem' }}>-</button>
                  <input
                    type="text"
                    value={quantita[popupProdotto.id] || 1}
                    readOnly
                    style={{ width: '2rem', textAlign: 'center' }}
                  />
                  <button onClick={() => cambiaQuantita(popupProdotto.id, 1)} style={{ fontSize: '1.2rem' }}>+</button>
                </div>

                <div className="gr-product-modal-actions" style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem', gap: '0.5rem' }}>
                  <button
                    className="gr-product-modal-button"
                    disabled={isSoldOut(popupProdotto)}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (aggiungiAlCarrello(popupProdotto)) {
                        setPopupProdotto(null);
                      }
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#333',
                      color: 'white',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '1rem',
                      cursor: 'pointer'
                    }}
                  >
                    {t('aggiungi')}
                  </button>

                  <button
                    className="gr-product-modal-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/checkout?lang=${lang}`);
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#333',
                      color: 'white',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '1rem',
                      cursor: 'pointer'
                    }}
                  >
                    {t('checkout')}
                  </button>
                </div>
              </>
            ) : (
              <a
                className="gr-product-request-button"
                href={buildPriceRequestHref(popupProdotto, lang)}
                onClick={(e) => e.stopPropagation()}
              >
                {getRequestPriceText(lang)}
              </a>
            )}
          </div>
        </div>
      )}

      <ProductionPolicyDialog
        open={Boolean(pendingProductionItem)}
        lang={lang}
        productName={pendingProductionItem?.prodotto?.nome}
        quantity={pendingProductionItem?.qta || 1}
        onCancel={() => setPendingProductionItem(null)}
        onAccept={() => {
          if (pendingProductionItem) {
            aggiungiProdottoAlCarrello(pendingProductionItem.prodotto, pendingProductionItem.qta);
          }
          setPendingProductionItem(null);
          setPopupProdotto(null);
          setImmagineAttiva('');
        }}
      />

      {cartNotice && (
        <div className="gr-product-toast" role="status" aria-live="polite">
          {cartNotice}
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button
          onClick={() => router.push(`/?lang=${lang}`)}
          style={{
            marginTop: '1rem',
            backgroundColor: '#444',
            color: 'white',
            padding: '0.6rem 1.2rem',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.95rem',
            cursor: 'pointer'
          }}
        >
          {t('indietro')}
        </button>
      </div>

    </main>
  );
}

export default function AccessoriPageWrapper() {
  return (
    <Suspense fallback={null}>
      <AccessoriPage />
    </Suspense>
  );
}
