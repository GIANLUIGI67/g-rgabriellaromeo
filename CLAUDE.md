# G-R Gabriella Romeo — Note per Claude

## Stack
- **Web**: Next.js 14 (App Router) deployato su Vercel, branch `main`
- **Mobile**: Capacitor — iOS (`ios app/`) e Android (`android app/`) caricano l'app da Vercel via WebView. Le modifiche web sono automaticamente live su mobile senza azioni aggiuntive.
- **Database**: Supabase (Postgres + Auth + Storage)
- **Pagamenti**: PayPal, Stripe, Bonifico bancario
- **Lingue UI**: it, en, fr, de, es, ar, zh, ja (traduzioni inline nei componenti)

## Deploy
Ogni `git push origin main` triggera il deploy automatico su Vercel. Non serve nessun comando manuale.

## Quando eseguire `npx cap sync`
Solo se si verifica uno di questi casi:
- Aggiunto/aggiornato un plugin Capacitor (`@capacitor/...`)
- Modificato `capacitor.config.ts`
- Aggiornato `@capacitor/core` o `@capacitor/cli`

**Non serve** per modifiche a pagine, API, logica, stili — quelle vanno live automaticamente.

## Quando applicare migration SQL su Supabase
Ogni volta che si crea un file in `supabase/migrations/`, il contenuto va eseguito manualmente nel **Supabase SQL Editor** del progetto `gr-gabriellaromeo-new`.

## Push su GitHub
Se `git push` fallisce con errore di autenticazione, usare:
```bash
gh auth setup-git && git push origin main
```

## Struttura ordini
- `ordini_temporanei`: bonifici in attesa di conferma admin. Quantità già sottratta dal magazzino.
- `ordini`: ordini confermati (PayPal/Carta subito, Bonifico dopo conferma admin).
- Stato `pagato` → sezione "Da spedire" in admin. Aggiunta tracking → sezione "Spediti".

## Sicurezza RLS — regole applicate
- `products`: scrittura solo admin (via `admin_emails`)
- `admin_emails`: scrittura solo admin esistenti; lettura tutti gli autenticati
- `eventi`: scrittura solo admin
- `ordini`: UPDATE solo admin
- `ordini_temporanei`: nessun accesso diretto client (solo service role)
- Check admin: sempre via `/api/check-admin` (service role), mai via client RLS

## Variabili d'ambiente necessarie
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`
- `STRIPE_SECRET_KEY`
