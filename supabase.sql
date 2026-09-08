create table if not exists public.payments (
  id bigint generated always as identity primary key,
  stripe_checkout_session_id text not null unique,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null,
  city text,
  region text,
  country text,
  latitude numeric(5,1),
  longitude numeric(5,1),
  paid_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- For an existing V1 table:
alter table public.payments add column if not exists city text;
alter table public.payments add column if not exists region text;
alter table public.payments add column if not exists latitude numeric(5,1);
alter table public.payments add column if not exists longitude numeric(5,1);

alter table public.payments enable row level security;

-- No public read policy. All public statistics are aggregated server-side.
create index if not exists payments_paid_at_idx on public.payments(paid_at);
create index if not exists payments_city_country_idx on public.payments(city,country);
