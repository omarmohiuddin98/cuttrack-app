-- Adds the "source location" field (Office / Workshop) to existing tickets.
-- Run this once in the Supabase SQL Editor against your live project
-- (schema.sql already has this column for anyone setting up fresh).

alter table tickets
  add column if not exists source_location text not null default 'Office'
  check (source_location in ('Office','Workshop'));
