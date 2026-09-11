# One Million Yes

Fresh Next.js setup for onemillionyes.com.

## Stripe amounts

- €1
- €5
- €10
- €100
- Custom amount from €1

## Fresh GitHub setup

Delete the old repository contents, then upload the CONTENTS of this folder to the repository root.

The repository root should contain:

- `app/`
- `lib/`
- `supabase/`
- `package.json`
- `tsconfig.json`
- `next.config.ts`
- `.env.example`
- `.gitignore`

Do not upload the parent folder itself as an extra nesting level.

## Vercel

Import the GitHub repository into Vercel and add these Environment Variables:

NEXT_PUBLIC_SITE_URL=https://onemillionyes.com

STRIPE_SECRET_KEY=<your Stripe live secret key>
STRIPE_PRICE_1=price_1UE7B2BN7VJnKCBMVlnJssxp
STRIPE_PRICE_5=price_1UE7B7BN7VJnKCBMM5nMkjf3
STRIPE_PRICE_10=price_1UE7BCBN7VJnKCBMkqKJfC2b
STRIPE_PRICE_100=price_1UE7BHBN7VJnKCBMIobXfmP8

SUPABASE_URL=<your Supabase URL>
SUPABASE_SERVICE_ROLE_KEY=<your service role key>

Do not set STRIPE_WEBHOOK_SECRET yet.

## Supabase

Open the SQL editor and run:

`supabase/schema.sql`

## First deploy

Deploy once.

Then verify:

https://onemillionyes.com/api/stats

It should return JSON.

## Stripe webhook

After the first successful deployment, create a Stripe webhook destination:

https://onemillionyes.com/api/stripe/webhook

Subscribe to:

- checkout.session.completed
- checkout.session.async_payment_succeeded

Copy the Stripe signing secret (`whsec_...`) into Vercel as:

STRIPE_WEBHOOK_SECRET

Redeploy.

## Test

Test €1 first, then €5, €10, €100 and Custom.

A cancelled checkout must not increase the counter.

A successful payment should appear once in Supabase and increment the counter once.
