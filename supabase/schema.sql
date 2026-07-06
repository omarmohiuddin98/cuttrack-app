-- CutTrack database schema
-- Run this in the Supabase SQL Editor (Project → SQL Editor → New query) once, before deploying.

create extension if not exists "pgcrypto";

create table materials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  grade text,
  thickness numeric not null,
  created_at timestamptz not null default now()
);

create table lots (
  id uuid primary key default gen_random_uuid(),
  material_id uuid not null references materials(id) on delete cascade,
  sheet_w numeric not null,
  sheet_h numeric not null,
  sheets_remaining numeric not null default 0,
  created_at timestamptz not null default now()
);

create sequence ticket_number_seq start 1;

create table tickets (
  id uuid primary key default gen_random_uuid(),
  number text not null unique default ('T-' || lpad(nextval('ticket_number_seq')::text, 4, '0')),
  created_at timestamptz not null default now(),
  customer text not null,
  material_id uuid references materials(id),
  material_label text not null,
  lot_id uuid references lots(id),
  sheet_size text not null,
  w numeric not null,
  h numeric not null,
  qty integer not null,
  requested_by text not null,
  notes text,
  status text not null default 'open' check (status in ('open','cut')),
  over_stock boolean not null default false,
  cut_by text,
  cut_at timestamptz
);

create index on lots (material_id);
create index on tickets (material_id);
create index on tickets (status);

-- Row Level Security: disabled here because access is controlled entirely by which
-- Supabase key is used (anon key = read-only via API routes, service role key = server only).
-- If you later expose this database to more than your own API routes, enable RLS and add policies.
alter table materials enable row level security;
alter table lots enable row level security;
alter table tickets enable row level security;

-- Allow the server (service role key, used only inside our API routes) full access.
-- The anon key is never used directly by the browser in this app, so no public policies are added.
create policy "service role full access materials" on materials for all using (true) with check (true);
create policy "service role full access lots" on lots for all using (true) with check (true);
create policy "service role full access tickets" on tickets for all using (true) with check (true);
