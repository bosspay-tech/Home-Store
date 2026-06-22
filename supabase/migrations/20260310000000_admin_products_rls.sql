-- Admin product write policies for Vyapar Vault storefront.
-- Run in Supabase SQL Editor after replacing admin emails below.
--
-- Without these policies, the admin panel UI may load but saves will fail
-- once RLS blocks authenticated writes.

alter table public.products enable row level security;

-- Public can read active products for the store (adjust if you already have this policy).
drop policy if exists "Public read active home-store products" on public.products;
create policy "Public read active home-store products"
  on public.products
  for select
  using (store_id = 'home-store' and is_active = true);

-- Admins can read all products (including hidden) for management.
drop policy if exists "Admin read all home-store products" on public.products;
create policy "Admin read all home-store products"
  on public.products
  for select
  to authenticated
  using (
    store_id = 'home-store'
    and (
      (auth.jwt() ->> 'email') in (
        'you@example.com'
      )
      or coalesce((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean, false)
    )
  );

drop policy if exists "Admin insert home-store products" on public.products;
create policy "Admin insert home-store products"
  on public.products
  for insert
  to authenticated
  with check (
    store_id = 'home-store'
    and (
      (auth.jwt() ->> 'email') in (
        'you@example.com'
      )
      or coalesce((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean, false)
    )
  );

drop policy if exists "Admin update home-store products" on public.products;
create policy "Admin update home-store products"
  on public.products
  for update
  to authenticated
  using (
    store_id = 'home-store'
    and (
      (auth.jwt() ->> 'email') in (
        'you@example.com'
      )
      or coalesce((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean, false)
    )
  )
  with check (store_id = 'home-store');
