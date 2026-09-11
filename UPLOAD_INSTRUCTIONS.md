# One Million Yes — manual GitHub upload

## Upload these files
- app/components/PaymentButtons.tsx
- app/api/checkout/route.ts
- app/api/stripe/webhook/route.ts
- app/api/stats/route.ts
- app/success/page.tsx
- lib/stripe.ts
- lib/supabaseAdmin.ts
- .env.example
- supabase/schema.sql

## Keep your current homepage design
Do NOT replace `app/page.tsx` if you want to preserve the current design.

Add at the top of your current `app/page.tsx`:

```tsx
import PaymentButtons from "./components/PaymentButtons";
```

Then replace the current single €1 payment button with:

```tsx
<PaymentButtons />
```

## Dependencies
Your package.json needs `stripe` and `@supabase/supabase-js`.
If they are already present, do nothing.

## Vercel environment variables
Set these in Vercel Project → Settings → Environment Variables:

NEXT_PUBLIC_SITE_URL=https://onemillionyes.com
STRIPE_SECRET_KEY=<your live Stripe secret key>
STRIPE_PRICE_1=price_1UE7B2BN7VJnKCBMVlnJssxp
STRIPE_PRICE_5=price_1UE7B7BN7VJnKCBMM5nMkjf3
STRIPE_PRICE_10=price_1UE7BCBN7VJnKCBMkqKJfC2b
STRIPE_PRICE_100=price_1UE7BHBN7VJnKCBMIobXfmP8
SUPABASE_URL=<your Supabase URL>
SUPABASE_SERVICE_ROLE_KEY=<your service role key>

Do not set STRIPE_WEBHOOK_SECRET until the webhook endpoint is deployed.
Never commit real secret values to GitHub.

## Supabase
Run `supabase/schema.sql` once in the Supabase SQL editor.

## After deployment
Create a Stripe webhook destination:
https://onemillionyes.com/api/stripe/webhook

Events:
- checkout.session.completed
- checkout.session.async_payment_succeeded

Then copy the Stripe signing secret `whsec_...` into Vercel as STRIPE_WEBHOOK_SECRET and redeploy.

## Test before public launch
- €1 / €5 / €10 / €100 each open Checkout
- Custom accepts >= €1
- completed payment is stored once
- cancelled payment is not stored
- counter only changes after confirmed payment
- no raw IP is stored
- only approximate city/country data is used for the map
