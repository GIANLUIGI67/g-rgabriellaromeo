import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AbbigliamentoPageContent() {
  const params = useSearchParams();
  const lang = params.get('lang') || 'it';
  const router = useRouter();

  const [prodotti, setProdotti] = useState([]);
  const [sottocategoriaSelezionata, setSottocategoriaSelezionata] = useState('');
  const [carrello, setCarrello] = useState([]);
  const [popupImg, setPopupImg] = useState(null);

  const traduzioni = {
    it: { titolo: 'GALLERIA ABBIGLIAMENTO', sottotutte: 'Tutte le sottocategorie', aggiungi: 'Aggiungi al carrello', checkout: 'Check-out', indietro: 'Indietro' },
    en: { titolo: 'FASHION WEAR', sottotutte: 'All subcategories', aggiungi: 'Add to cart', checkout: 'Checkout', indietro: 'Back' },
    fr: { titolo: 'VÊTEMENTS', sottotutte: 'Toutes les sous-catégories', aggiungi: 'Ajouter au panier', checkout: 'Paiement', indietro: 'Retour' },
    de: { titolo: 'BEKLEIDUNG', sottotutte: 'Alle Unterkategorien', aggiungi: 'In den Warenkorb', checkout: 'Zur Kasse', indietro: 'Zurück' },
    es: { titolo: 'ROPA', sottotutte: 'Todas las subcategorías', aggiungi: 'Agregar al carrito', checkout: 'Pagar', indietro: 'Atrás' },
    ar: { titolo: 'ملابس', sottotutte: 'جميع الفئات الفرعية', aggiungi: 'أضف إلى السلة', checkout: 'الدفع', indietro: 'عودة' },
    zh: { titolo: '服饰', sottotutte: '所有子类别', aggiungi: '加入购物车', checkout: '结账', indietro: '返回' },
    ja: { titolo: 'ファッションウェア', sottotutte: 'すべてのサブカテゴリ', aggiungi: 'カートに追加', checkout: 'チェックアウト', indietro: '戻る' }
  };

  const sottocategorie = {
    abiti: { it: 'abiti', en: 'dresses', fr: 'robes', de: 'kleider', es: 'vestidos', ar: 'فساتين', zh: '连衣裙', ja: 'ドレス' },
    'camicie top': { it: 'camicie top', en: 'shirts & tops', fr: 'chemises & tops', de: 'hemden & tops', es: 'camisas y tops', ar: 'قمصان وبلوزات', zh: '衬衫和上衣', ja: 'シャツとトップス' },
    pantaloni: { it: 'pantaloni', en: 'trousers', fr: 'pantalons', de: 'hosen', es: 'pantalones', ar: 'سراويل', zh: '裤子', ja: 'ズボン' },
    gonne: { it: 'gonne', en: 'skirts', fr: 'jupes', de: 'röcke', es: 'faldas', ar: 'تنانير', zh: '裙子', ja: 'スカート' },
    'giacche e cappotti': { it: 'giacche e cappotti', en: 'jackets & coats', fr: 'vestes & manteaux', de: 'jacken & mäntel', es: 'chaquetas y abrigos', ar: 'سترات ومعاطف', zh: '夹克和大衣', ja: 'ジャケットとコート' },
    abaye: { it: 'abaye', en: 'abayas', fr: 'abayas', de: 'abajas', es: 'abayas', ar: 'عبايات', zh: '阿拜亚', ja: 'アバヤ' },
    caftani: { it: 'caftani', en: 'kaftans', fr: 'caftans', de: 'kaftane', es: 'caftanes', ar: 'قفاطين', zh: '开襟长袍', ja: 'カフタン' },
    'abbigliamento da mare': { it: 'abbigliamento da mare', en: 'beachwear', fr: 'tenues de plage', de: 'badebekleidung', es: 'ropa de playa', ar: 'ملابس بحر', zh: '泳装', ja: 'ビーチウェア' }
  };

  useEffect(() => {
    fetch('/data/products.json')
      .then(res => res.json())
      .then(data => setProdotti(data))
      .catch(err => console.error('Errore nel caricamento prodotti:', err));
  }, []);

  const filtrati = prodotti.filter(p =>
    p.categoria === 'abbigliamento' &&
    (!sottocategoriaSelezionata || p.sottocategoria === sottocategoriaSelezionata)
  );

  const aggiungiAlCarrello = (prodotto) => {
    const nuovoCarrello = [...carrello, prodotto];
    setCarrello(nuovoCarrello);
    localStorage.setItem('carrello', JSON.stringify(nuovoCarrello));
  };

  return (
    <main style={{ backgroundColor: 'black', color: 'white', padding: '2rem' }}>
      <h1>{traduzioni[lang]?.titolo}</h1>

      <select
        value={sottocategoriaSelezionata}
        onChange={e => setSottocategoriaSelezionata(e.target.value)}
        style={{ marginBottom: '1rem', padding: '0.5rem' }}
      >
        <option value="">{traduzioni[lang]?.sottotutte}</option>
        {Object.entries(sottocategorie).map(([key, label]) => (
          <option key={key} value={key}>{label[lang]}</option>
        ))}
      </select>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
        {filtrati.map(prodotto => (
          <div key={prodotto.id} style={{ background: 'white', color: 'black', padding: '1rem' }}>
            <Image
              src={`/uploads/${prodotto.nomeImmagine}`}
              alt={prodotto.nome}
              width={200}
              height={120}
            />
            <p>{prodotto.nome}</p>
            <p>{prodotto.prezzo} €</p>
            <button onClick={() => aggiungiAlCarrello(prodotto)}>
              {traduzioni[lang]?.aggiungi}
            </button>
          </div>
        ))}
      </div>

      {carrello.length > 0 && (
        <button onClick={() => router.push(`/checkout?lang=${lang}`)} style={{ marginTop: '2rem' }}>
          {traduzioni[lang]?.checkout}
        </button>
      )}

      <button onClick={() => router.push(`/?lang=${lang}`)} style={{ marginTop: '1rem' }}>
        {traduzioni[lang]?.indietro}
      </button>
    </main>
  );
}
