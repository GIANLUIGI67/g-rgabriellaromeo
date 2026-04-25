## Supabase mobile backend

This project is moving the sensitive checkout backend out of Next.js API routes and into Supabase Edge Functions.

Current functions:

- `checkout-quote`
- `payment-intent`
- `checkout-finalize`

Required project secrets in Supabase:

- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`

Frontend switch:

- keep `NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL` empty to use local Next API routes
- set `NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL=https://<project-ref>.supabase.co/functions/v1` to use Edge Functions

Suggested deploy order:

1. `supabase login`
2. `supabase link --project-ref <project-ref>`
3. `supabase secrets set ...`
4. `supabase functions deploy checkout-quote`
5. `supabase functions deploy payment-intent`
6. `supabase functions deploy checkout-finalize`
