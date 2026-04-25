# App mobile iOS + Android

Questo progetto usa gia' frontend e backend nello stesso repository Next.js.
Per pubblicarlo su App Store e Play Store senza riscrivere tutto in React Native o Flutter,
la strada piu' veloce e stabile e' usare `Capacitor` come shell nativa che carica
la web app deployata dello stesso progetto.

## Architettura

- `Next.js`: frontend, API routes e integrazioni Stripe/Supabase.
- `Capacitor`: contenitore nativo per iOS e Android.
- `CAPACITOR_APP_URL`: URL pubblico della tua app deployata, per esempio dominio custom o Vercel production.

In pratica:

1. Deploy del progetto Next.js.
2. L'app iOS/Android apre quell'URL dentro un container nativo.
3. Gli acquisti, auth, admin e API continuano a usare la stessa infrastruttura del progetto.

## Variabili ambiente

Aggiungi in `.env.local`:

```bash
NEXT_PUBLIC_SITE_URL=https://tuo-dominio.it
CAPACITOR_APP_ID=com.tuobrand.grgabriellaromeo
CAPACITOR_APP_NAME=G-R Gabriella Romeo
CAPACITOR_APP_URL=https://tuo-dominio.it
```

Note:

- `CAPACITOR_APP_ID` deve essere definitivo prima della pubblicazione.
- Su iOS e Android il bundle identifier/package name deve combaciare con quello registrato negli store.

## Prima configurazione

Installa una sola volta i progetti nativi:

```bash
npm run cap:add:ios
npm run cap:add:android
```

Poi sincronizza:

```bash
npm run cap:sync
```

I workspace nativi sono tenuti in:

- `ios app/`
- `android app/`

## Asset app

Metti i file base dentro `resources/`:

- `resources/icon.png`
- `resources/splash.png`

Poi genera le risorse native:

```bash
npm run mobile:assets
```

## Apertura dei progetti nativi

```bash
npm run cap:open:ios
npm run cap:open:android
```

## Store checklist

### Apple App Store

- Crea l'app in App Store Connect con lo stesso bundle ID di `CAPACITOR_APP_ID`.
- In Xcode imposta team, signing e deployment target.
- Carica icone, screenshot, privacy nutrition labels e descrizione.
- Verifica i permessi realmente usati prima di inviare la build.

### Google Play Store

- Crea l'app in Google Play Console con package name allineato a `CAPACITOR_APP_ID`.
- In Android Studio verifica `applicationId`, signing e versione.
- Genera un `AAB` signed per la submission.
- Completa Data safety, contenuti, screenshot e scheda store.

## Raccomandazioni importanti

- Usa un dominio production stabile in `CAPACITOR_APP_URL`, non un URL temporaneo.
- Prima della submission verifica che login, checkout, email e tutte le API Next funzionino in produzione HTTPS.
- Se vuoi notifiche push, deep link, biometric login o Apple Pay/Google Pay nativi, possiamo aggiungerli sopra questa base.
- Le app store accettano piu' facilmente una shell web quando il prodotto e' completo, brandizzato e con valore reale oltre al semplice sito incorniciato.

## Comandi utili

```bash
npm run cap:doctor
npm run cap:sync
npm run cap:open:ios
npm run cap:open:android
```
