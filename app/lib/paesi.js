import countries from 'i18n-iso-countries';

// Registra le lingue in modo da poterle usare
import it from 'i18n-iso-countries/langs/it.json';
import en from 'i18n-iso-countries/langs/en.json';
import fr from 'i18n-iso-countries/langs/fr.json';
import de from 'i18n-iso-countries/langs/de.json';
import es from 'i18n-iso-countries/langs/es.json';
import ar from 'i18n-iso-countries/langs/ar.json';
import zh from 'i18n-iso-countries/langs/zh.json';
import ja from 'i18n-iso-countries/langs/ja.json';

countries.registerLocale(it);
countries.registerLocale(en);
countries.registerLocale(fr);
countries.registerLocale(de);
countries.registerLocale(es);
countries.registerLocale(ar);
countries.registerLocale(zh);
countries.registerLocale(ja);

const supportedLangs = ['it', 'en', 'fr', 'de', 'es', 'ar', 'zh', 'ja'];

const paesi = supportedLangs.reduce((acc, lang) => {
  acc[lang] = Object.values(countries.getNames(lang, { select: 'official' }));
  acc[lang].sort((a, b) => a.localeCompare(b, lang));
  return acc;
}, {});

export default paesi;
