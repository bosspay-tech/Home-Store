-- Billing address on orders (delivery address columns unchanged).
-- Run in Supabase SQL Editor if not using Supabase CLI migrations.

alter table public.orders
  add column if not exists billing_same_as_delivery boolean not null default true,
  add column if not exists billing_address text,
  add column if not exists billing_city text,
  add column if not exists billing_state text,
  add column if not exists billing_pincode text;
