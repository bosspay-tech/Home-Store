-- Run this in your Supabase SQL Editor to create (and/or extend) the
-- `bosspay_txns` table. The base 5 columns are what `@bosspay/bridge-node`
-- (`SupabaseTxnStore`) reads/writes; the remaining columns are what this
-- bridge's `server.ts` and nineteenpay reconciler need for webhook-miss recovery.
--
-- Safe to re-run — every statement uses `if not exists` / `add column if not exists`.

create table if not exists public.bosspay_txns (
  pg_transaction_id text primary key,
  txn_id           text not null,
  pg_type          text not null,
  callback_url     text not null,
  created_at       timestamptz not null default now()
);

create index if not exists bosspay_txns_txn_id_idx
  on public.bosspay_txns (txn_id);

create index if not exists bosspay_txns_created_at_idx
  on public.bosspay_txns (created_at);

-- ── Webhook-delivery + reconciler columns ────────────────────────────

alter table public.bosspay_txns
  add column if not exists payment_status                text,
  add column if not exists amount_paisa                  bigint,
  add column if not exists gateway_payload               jsonb,
  add column if not exists callback_forwarded_at         timestamptz,
  add column if not exists callback_forward_http_status  integer,
  add column if not exists reconcile_last_attempt_at     timestamptz,
  add column if not exists reconcile_attempts            integer not null default 0,
  add column if not exists updated_at                    timestamptz not null default now();

-- Index supports the reconciler's per-tick sweep:
--   SELECT ... WHERE pg_type='nineteenpay' AND callback_forwarded_at IS NULL
--   AND created_at BETWEEN (now() - 15m) AND (now() - 10s)
create index if not exists bosspay_txns_reconcile_idx
  on public.bosspay_txns (pg_type, callback_forwarded_at, created_at);

-- ── PG identifier mapping ────────────────────────────────────────────
-- BossPay UUID stays the row primary key (`pg_transaction_id`).
-- The PG-side identifier returned at `/collect` (e.g. 19Pay's
-- `transactionId`) is persisted here so callbacks can be resolved by
-- the PG's own id even when the PG truncates/renames the `collect_ref`
-- we sent (19Pay caps `orderId` at 44 chars = 14 timestamp + 30 hex).
alter table public.bosspay_txns
  add column if not exists provider_txn_id       text,
  add column if not exists provider_collect_ref  text;

-- Unique only when set, so legacy rows (NULL) don't conflict with each other.
create unique index if not exists bosspay_txns_provider_txn_id_uk
  on public.bosspay_txns (provider_txn_id)
  where provider_txn_id is not null;

create index if not exists bosspay_txns_provider_collect_ref_idx
  on public.bosspay_txns (provider_collect_ref);
