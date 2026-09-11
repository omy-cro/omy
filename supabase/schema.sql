create extension if not exists pgcrypto;

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  stripe_checkout_session_id text unique not null,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'eur',
  city text,
  region text,
  country text,
  latitude numeric(5,1),
  longitude numeric(5,1),
  paid_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.payments enable row level security;
-- Intentionally no public policies. Server access uses the service-role key.
