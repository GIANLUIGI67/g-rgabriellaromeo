'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

export default function AccessoriPage() {
  const params = useSearchParams();
  const lang = params.get('lang') || 'it';
  const router = useRouter();

  const [prodotti, setProdotti] = useState([]);
  const [quantita, setQuantita] = useState({});
  const [sottocategoriaSelezionata, setSottocategoriaSelezionata] = useState('');
  const [carrello, setCarrello] = useState([]);
  const [popupImg, setPopupImg] = useState(null);
  const [showPolicy, setShowPolicy] = useState(false);
  const [erroreQuantita, setErroreQuantita] = useState(false);
  const [accettaPolicy, setAccettaPolicy] = useState(false);

  const traduzioni = {
    it: { titolo: 'GALLERIA ACCESSORI', sottotutte: 'Tutte le sottocategorie', aggiungi: 'Aggiungi al carrello', checkout: 'Check-out', indietro: 'Indietro', venduto: 'venduto', erroreQuantita: 'La quantità richiesta è superiore alla disponibilità! Per confermare comunque, controlla la nostra policy per la produzione.', visualizzaPolicy: 'Visualizza Policy', accetta: 'Sono d\'accordo con la policy per la produzione', continua: 'Continua con l’ordine', rimuovi: 'Rimuovi', carrello: 'Carrello', policyTitolo: 'Policy per la produzione' },
    en: { titolo: 'ACCESSORY GALLERY', sottotutte: 'All subcategories', aggiungi: 'Add to cart', checkout: 'Checkout', indietro: 'Back', venduto: 'sold', erroreQuantita: 'Requested quantity exceeds available stock! To confirm anyway, check our production policy.', visualizzaPolicy: 'View Policy', accetta: 'I agree with the production policy', continua: 'Continue with order', rimuovi: 'Remove', carrello: 'Cart', policyTitolo: 'Production Policy' },
    fr: { titolo: 'GALERIE D\'ACCESSOIRES', sottotutte: 'Toutes les sous-catégories', aggiungi: 'Ajouter au panier', checkout: 'Passer à la caisse', indietro: 'Retour', venduto: 'vendu', erroreQuantita: 'La quantité demandée dépasse le stock! Consultez notre politique de production.', visualizzaPolicy: 'Voir la politique', accetta: 'J’accepte la politique de production', continua: 'Continuer la commande', rimuovi: 'Supprimer', carrello: 'Panier', policyTitolo: 'Politique de production' },
    de: { titolo: 'ZUBEHÖRGALERIE', sottotutte: 'Alle Unterkategorien', aggiungi: 'In den Warenkorb', checkout: 'Zur Kasse', indietro: 'Zurück', venduto: 'ausverkauft', erroreQuantita: 'Angeforderte Menge übersteigt den Bestand! Prüfen Sie unsere Produktionsrichtlinie.', visualizzaPolicy: 'Richtlinie anzeigen', accetta: 'Ich stimme der Produktionsrichtlinie zu', continua: 'Bestellung fortsetzen', rimuovi: 'Entfernen', carrello: 'Warenkorb', policyTitolo: 'Produktionsrichtlinie' },
    es: { titolo: 'GALERÍA DE ACCESORIOS', sottotutte: 'Todas las subcategorías', aggiungi: 'Agregar al carrito', checkout: 'Finalizar compra', indietro: 'Atrás', venduto: 'vendido', erroreQuantita: '¡Cantidad solicitada supera el stock! Revisa nuestra política de producción.', visualizzaPolicy: 'Ver política', accetta: 'Acepto la política de producción', continua: 'Continuar pedido', rimuovi: 'Eliminar', carrello: 'Carrito', policyTitolo: 'Política de producción' },
    zh: { titolo: '配件画廊', sottotutte: '所有子类别', aggiungi: '添加到购物车', checkout: '结账', indietro: '返回', venduto: '售罄', erroreQuantita: '请求数量超出库存！请查看我们的生产政策。', visualizzaPolicy: '查看政策', accetta: '我同意生产政策', continua: '继续下单', rimuovi: '移除', carrello: '购物车', policyTitolo: '生产政策' },
    ar: { titolo: 'معرض الإكسسوارات', sottotutte: 'كل الفئات الفرعية', aggiungi: 'أضف إلى السلة', checkout: 'إتمام الشراء', indietro: 'رجوع', venduto: 'تم البيع', erroreQuantita: 'الكمية المطلوبة تتجاوز المتوفر! تحقق من سياسة الإنتاج.', visualizzaPolicy: 'عرض السياسة', accetta: 'أوافق على سياسة الإنتاج', continua: 'متابعة الطلب', rimuovi: 'إزالة', carrello: 'عربة التسوق', policyTitolo: 'سياسة الإنتاج' },
    ja: { titolo: 'アクセサリーギャラリー', sottotutte: 'すべてのサブカテゴリ', aggiungi: 'カートに追加', checkout: 'チェックアウト', indietro: '戻る', venduto: '売切れ', erroreQuantita: 'リクエスト数が在庫を超えています。生産ポリシーをご確認ください。', visualizzaPolicy: 'ポリシーを見る', accetta: '生産ポリシーに同意します', continua: '注文を続ける', rimuovi: '削除', carrello: 'カート', policyTitolo: '生産ポリシー' }
  };

  const t = (key) => traduzioni[lang]?.[key] || traduzioni['it'][key] || key;

  const sottocategorie = {
    collane: { it: 'collane', en: 'necklaces', fr: 'colliers', de: 'halsketten', es: 'collares', ar: 'قلائد', zh: '项链', ja: 'ネックレス' },
    orecchini: { it: 'orecchini', en: 'earrings', fr: "boucles d'oreilles", de: 'ohrringe', es: 'pendientes', ar: 'أقراط', zh: '耳环', ja: 'イヤリング' },
    bracciali: { it: 'bracciali', en: 'bracelets', fr: 'bracelets', de: 'armbänder', es: 'pulseras', ar: 'أساور', zh: '手镯', ja: 'ブレスレット' },
    borse: { it: 'borse', en: 'bags', fr: 'sacs', de: 'taschen', es: 'bolsos', ar: 'حقائب', zh: '包', ja: 'バッグ' },
    foulard: { it: 'foulard', en: 'scarves', fr: 'foulards', de: 'schals', es: 'pañuelos', ar: 'أوشحة', zh: '围巾', ja: 'スカーフ' }
  };

  useEffect(() => {
    const fetchProdotti = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('categoria', 'accessori')
        .order('created_at', { ascending: false });

      if (!error) {
        setProdotti(data);
        const iniziali = {};
        data.forEach(p => { iniziali[p.id] = 1 });
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

  const aggiungiAlCarrello = (prodotto) => {
    const qta = quantita[prodotto.id] || 1;
    if (prodotto.quantita !== null && prodotto.quantita !== undefined && qta > prodotto.quantita) {
      setErroreQuantita(true);
      return;
    }
    const nuovoCarrello = [...carrello, ...Array(qta).fill(prodotto)];
    setCarrello(nuovoCarrello);
    localStorage.setItem('carrello', JSON.stringify(nuovoCarrello));
  };

  const rimuoviDalCarrello = (prodottoId) => {
    const nuovoCarrello = carrello.filter(p => p.id !== prodottoId);
    setCarrello(nuovoCarrello);
    localStorage.setItem('carrello', JSON.stringify(nuovoCarrello));
  };

  return (
    <main style={{ backgroundColor: 'black', color: 'white', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>{t('titolo')}</h1>

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <select
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

      <div style={{ display: 'flex', overflowX: 'auto', gap: '1rem', width: '100%', padding: '0.5rem', scrollSnapType: 'x mandatory' }}>
        {filtrati.map(prodotto => (
          <div key={prodotto.id} style={{
            backgroundColor: 'white',
            color: 'black',
            padding: '0.5rem',
            borderRadius: '6px',
            fontSize: '0.65rem',
            textAlign: 'center',
            flex: '0 0 auto',
            width: '160px',
            scrollSnapAlign: 'start',
            position: 'relative'
          }}>
            {prodotto.offerta && (
              <div style={{
                position: 'absolute',
                top: '-6px',
                left: '-4px',
                backgroundColor: 'red',
                color: 'white',
                padding: '0.1rem 0.2rem',
                borderRadius: '4px',
                fontSize: '0.5rem'
              }}>✨ OFFERTA</div>
            )}
            {prodotto.quantita === 0 && (
              <div style={{
                position: 'absolute',
                top: '6px',
                left: '6px',
                backgroundColor: 'rgba(255, 0, 0, 0.2)',
                color: 'red',
                padding: '2px 4px',
                fontSize: '0.5rem',
                borderRadius: '3px',
                transform: 'rotate(-12deg)',
                fontWeight: 'bold'
              }}>{t('venduto')}</div>
            )}
            <img
              src={`https://xmiaatzxskmuxyzsvyjn.supabase.co/storage/v1/object/public/immagini/${prodotto.immagine}`}
              alt={prodotto.nome}
              style={{ width: '100%', maxHeight: '80px', objectFit: 'contain', borderRadius: '4px', marginBottom: '0.3rem', cursor: 'pointer' }}
              onClick={() => setPopupImg(`https://xmiaatzxskmuxyzsvyjn.supabase.co/storage/v1/object/public/immagini/${prodotto.immagine}`)}
            />
            <strong>{prodotto.nome}</strong>
            <p>{prodotto.taglia}</p>
            <p style={{ fontFamily: 'Arial, sans-serif' }}>{'\u20AC'} {(Math.round(Number(prodotto.prezzo || 0) * 10) / 10).toFixed(1)}</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.3rem', margin: '0.3rem 0' }}>
              <button onClick={() => cambiaQuantita(prodotto.id, -1)} style={{ background: 'none', border: 'none', fontSize: '1rem', cursor: 'pointer' }}>–</button>
              <input type="text" value={quantita[prodotto.id] || 1} readOnly style={{ width: '1.8rem', textAlign: 'center', background: 'white', color: 'black', fontSize: '0.9rem', border: '1px solid black', borderRadius: '4px', padding: '1px 3px' }} />
              <button onClick={() => cambiaQuantita(prodotto.id, 1)} style={{ background: 'none', border: 'none', fontSize: '1rem', cursor: 'pointer' }}>+</button>
            </div>
            <button onClick={() => aggiungiAlCarrello(prodotto)} style={{ padding: '0.2rem 0.4rem', fontSize: '0.6rem', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              {t('aggiungi')}
            </button>
          </div>
        ))}
      </div>

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
