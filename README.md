# One Million Yes

A small production-ready MVP for the "Can 1,000,000 people each send €1?" experiment.

## Architecture

- Next.js: website + server routes
- Stripe Checkout: €1 payment
- Stripe Webhook: only confirmed payments are counted
- Supabase Postgres: stores one row per successful Checkout session
- Vercel: recommended hosting

The public counter does **not** increment when someone merely clicks the button. It changes only after Stripe sends a signed `checkout.session.completed` event with `payment_status = paid`.

## 1. Create the Supabase database

1. Create a Supabase project.
2. Open SQL Editor.
3. Run the complete contents of `supabase.sql`.
4. Copy:
   - Project URL
   - Service Role key

Do not expose the Service Role key in client-side code.

## 2. Create/configure Stripe

1. Create/open a Stripe account.
2. Use Test mode first.
3. Copy the Stripe Secret Key.
4. The app creates €1 Checkout Sessions dynamically, so you do not need to create a Stripe Product manually.

## 3. Local environment

Copy `.env.example` to `.env.local` and fill in:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

Install and start:

```bash
npm install
npm run dev
```

## 4. Test the Stripe webhook locally

Install and sign in to the Stripe CLI.

Forward Stripe events to:

```bash
stripe listen --forward-to localhost:3000/api/webhook
```

The CLI prints a webhook signing secret beginning with `whsec_`. Put that value into `STRIPE_WEBHOOK_SECRET`.

Then open the site and complete a Stripe test Checkout.

## 5. Deploy to Vercel

1. Put this project in a GitHub repository.
2. Import the repository into Vercel.
3. Add all environment variables from `.env.example`.
4. Change `NEXT_PUBLIC_SITE_URL` to the final production URL.
5. Deploy.

## 6. Create the production webhook in Stripe

In Stripe Workbench / Webhooks, create an HTTPS webhook endpoint:

```text
https://YOUR-DOMAIN/api/webhook
```

Subscribe to:

```text
checkout.session.completed
```

Copy the production webhook signing secret (`whsec_...`) into Vercel as `STRIPE_WEBHOOK_SECRET`, then redeploy.

## 7. Switch Stripe from Test to Live

Replace the test secret key with the live secret key and use the live webhook secret.

## What the counter shows

- supporters: number of confirmed EUR Checkout sessions
- amount: sum of confirmed EUR payments
- countries: distinct billing countries available from Stripe Checkout

For the current MVP each Checkout is exactly €1.

## Important launch notes

Before launch, add:
- legal notice / imprint where required
- privacy policy
- clear explanation that this is not a charitable donation unless a qualified charity is the recipient
- tax/accounting review for the legal treatment of received payments
- refund/contact information


## V2: City-level generosity map

When `/api/checkout` runs on Vercel, it reads Vercel's geolocation headers:
- `x-vercel-ip-city`
- `x-vercel-ip-country-region`
- `x-vercel-ip-country`
- `x-vercel-ip-latitude`
- `x-vercel-ip-longitude`

The application does not read or persist the raw IP address. Latitude/longitude are rounded to one decimal place before being put into Stripe Checkout metadata. The webhook writes only the coarse values after payment succeeds.

Run the updated `supabase.sql` before deploying V2.

### Contact address
Replace `hello@example.com` in `app/page.tsx` with the public project alias, e.g. `hello@yourdomain.com`.

### Important privacy note
The included Privacy page is a technical placeholder, not a complete legal privacy policy. Have the final legal text reviewed before launch.
