# Aggiornamento sicurezza del 2 ottobre 2026

## Versione recuperabile

Il commit originale è `a2d13741abade2e2d21a433a49327379e414dbba`.
È conservato su GitHub nel ramo `backup/pre-security-2026-10-02`.
Le modifiche sono isolate in `fix/security-updates-2026-10-02`.
Il ramo di backup conserva codice e lockfile, non dati, credenziali o configurazioni Vercel.

## Modifiche

| Pacchetto | Versione nel lockfile originale | Versione aggiornata |
| --- | --- | --- |
| next | 15.5.15 | 15.5.27 |
| eslint-config-next | 15.5.15 | 15.5.27 |
| @paypal/react-paypal-js | 8.9.2 | 10.5.2 |
| @paypal/paypal-js (transitivo) | 9.7.0 | 11.2.0 |
| @supabase/supabase-js | 2.105.1 | 2.105.1, fissata anche nel manifest |

Next.js 15.5.27 contiene le correzioni del 30 settembre. Il progetto configura
immagini remote su Supabase: l'aggiornamento copre anche il relativo advisory SSRF.
Non è stata verificata la sfruttabilità dell'installazione pubblicata.
PayPal 10.5.2 contiene le protezioni contro prototype pollution pubblicate il
28 settembre. Si conserva l'integrazione SDK v5 con gli export principali,
senza migrare al percorso `sdk-v6`.

Stripe conserva SDK, API `2024-06-20` e creazione PaymentIntent con
`automatic_payment_methods`. L'annuncio relativo alla nuova API non richiede
di cambiarne ora la versione. Webhook e impostazioni dell'account non sono
stati verificati.

Fonti ufficiali:

- https://nextjs.org/blog/september-2026-security-release
- https://github.com/paypal/paypal-js/releases/tag/%40paypal%2Freact-paypal-js%4010.5.2
- https://supabase.com/changelog

## Verifica e rilascio

La suite originale passa prima e dopo l'aggiornamento (11 suite, 16 test).
La build Next.js aggiornata completa compilazione, lint, controllo tipi e
generazione di 70 pagine con Node 22.23.3. Sono stati usati valori di ambiente
fittizi: questa prova non verifica credenziali o transazioni reali.
Il test aggiunto esercita il vero wrapper React PayPal con una simulazione
del solo SDK remoto: controlla parametri dello script, rendering e callback.
La suite finale passa con 12 suite e 17 test; `git diff --check` non segnala errori.

Prima del rilascio, verificare in ambiente di prova login cliente/admin,
carrello, immagini, pagamento Stripe e PayPal sandbox, annullamento e conferma
ordine una sola volta. Ripetere i percorsi principali nella WebView mobile.
La connessione Vercel disponibile restituisce 403 sul progetto; non è stato
eseguito alcun rilascio in produzione. Il push su `main` attiva il deploy
automatico: non unirvi questo ramo prima della verifica di checkout.

## Ripristino applicazione

Se il ramo non è ancora stato unito, mantenere `main` e chiudere la PR.
Se è stato pubblicato e provoca errori, ripristinare in Vercel il deployment
precedente verificato, poi annullare il commit di aggiornamento su GitHub
con **Revert** nella PR. Con merge commit usare `git revert -m 1 <merge_sha>`;
con squash usare `git revert <squash_sha>`. Evitare reset o push forzati.
Attendere la build del revert e verificare login, carrello e checkout.

Per ricostruire l'originale separatamente:

```sh
git fetch origin
git switch -c recovery/security-2026-10-02 origin/backup/pre-security-2026-10-02
npm ci
npm run build
```

Usare Node 22 e le variabili dell'ambiente corretto per la build. Il ritorno
alle vecchie dipendenze riapre le vulnerabilità corrette: serve come misura
temporanea di recupero, seguita da una correzione e un nuovo rilascio.

## Database: controlli senza modifiche

Il database collegato usa PostgreSQL 17.6; l'aggiornamento Supabase a 17.11
resta da eseguire dopo aver verificato backup recente e procedura di restore.
Non è stata accertata la disponibilità del ripristino: il backup Git non può
recuperare clienti, ordini o configurazioni del database.

Le sette tabelle pubbliche hanno RLS attivo e grant già presenti. La modifica
Supabase del 30 ottobre sui nuovi oggetti non elimina questi permessi.
Le future migrazioni devono dichiarare GRANT minimi espliciti e policy RLS;
le tabelle temporanee degli ordini devono restare accessibili solo dal backend.

Non risultano installate ltree o btree_gist. Nelle funzioni pubbliche non sono
emersi riferimenti ai cifrari legacy e non risultano operatori personalizzati
pubblici. Questi controlli non certificano l'assenza di dati cifrati da sistemi
esterni. Nessuna modifica a schema, policy, utenti o dati è stata applicata.
