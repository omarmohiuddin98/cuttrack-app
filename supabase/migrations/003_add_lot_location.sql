-- Adds per-location stock tracking (Office / Workshop) to sheet lots.
-- Run this once in the Supabase SQL Editor against your live project
-- (schema.sql already has this column for anyone setting up fresh).

alter table lots
  add column if not exists location text not null default 'Office'
  check (location in ('Office','Workshop'));
