# Google Play Data safety - G-R Gabriella Romeo

Aggiornato: 5 luglio 2026

## Reject letto da Play Console

- Problema: `Data safety section in Google Play User Data policy: Invalid Data safety form`.
- Evidenza Google: `Data safety (Device or other IDs not declared)`.
- Versione coinvolta: version code `5`, version name `1.2.2`.
- Azione richiesta da Google: dichiarare il tipo dati `Device or other IDs` oppure rimuovere la funzionalita'/SDK che lo raccoglie.

## Audit locale

- Manifest sorgente: solo `android.permission.INTERNET`.
- Manifest merged release: aggiunge `android.permission.ACCESS_NETWORK_STATE` da `com.stripe:stripe-core:21.19.0`.
- SDK pagamenti Android: `com.stripe:stripe-android:21.19.0`, `com.stripe:paymentsheet`, `com.stripe:attestation`, Google Play Integrity e Google Play Services Wallet come dipendenze transitive.
- Backend/app raccolgono account, profilo cliente, ordini, metodo/esito pagamento, transaction id, email di conferma ordine e tracking accesso tecnico.
- Il lookup IP client-side verso `api.ipify.org`, `ipapi.co` e `ipwho.is` e' stato rimosso dai componenti utente.

## Data safety declaration da mantenere

### Data collection and security

- App collects or shares user data: `Yes`.
- Data encrypted in transit: `Yes`.
- Users can request data deletion: `Yes`.
- Deletion URL: `https://g-rgabriellaromeo.vercel.app/account-deletion`.
- Privacy policy URL: `https://g-rgabriellaromeo.vercel.app/privacy`.

### Data types

Se una voce esiste gia' nella dichiarazione, non rimuoverla; verifica solo che sia coerente con queste pratiche.

- Personal info > Name: collected. Purposes: app functionality, account management.
- Personal info > Email address: collected. Purposes: app functionality, account management, developer communications, fraud prevention/security/compliance.
- Personal info > User IDs: collected. Purposes: app functionality, account management, fraud prevention/security/compliance.
- Personal info > Address: collected for checkout/shipping. Purposes: app functionality, account management.
- Personal info > Phone number: collected for checkout/customer profile. Purposes: app functionality, account management.
- Financial info > Purchase history: collected. Purposes: app functionality, account management, fraud prevention/security/compliance.
- App activity > App interactions: collected. Purposes: analytics, app functionality, fraud prevention/security/compliance.
- App info and performance > Diagnostics: collected by app infrastructure/SDKs when applicable. Purposes: analytics, app functionality, fraud prevention/security/compliance.
- Device or other IDs > Device or other IDs: collected. Purposes: app functionality, fraud prevention/security/compliance, analytics if Play asks for SDK diagnostics/health use.

### Sharing

- Payment card numbers entered directly in Stripe/PayPal do not need to be declared as app-collected payment info if the app never accesses the full card details and collection is governed by the payment provider.
- Keep service-provider processing disclosed through the privacy policy. In Play Console, mark data as shared only when the flow transfers it to a third party outside service-provider processing, for example payment/shipping provider flows if Play asks specifically for sharing.

### Optional vs required

- Account/profile/checkout data can be marked optional where Play allows optional collection, because users can browse the catalog without account or checkout.
- Device or other IDs from payment/security SDKs should be treated as required while those SDKs remain in the release.

## Review notes

- Do not remove `Device or other IDs` while Stripe Android/PaymentSheet remains in the release.
- No `npx cap sync` is required for the privacy policy or web code changes.
- If a new Android bundle is uploaded, increment `versionCode` and keep this Data safety declaration aligned with the shipped dependencies.
