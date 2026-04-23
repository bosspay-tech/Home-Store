/**
 * 19Pay callback-miss reconciler.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { BossPayBridge } from '@bosspay/bridge-node';
import {
  queryNineteenPayStatus,
  resolveNineteenPayStatus,
  type NineteenPayConfig,
} from './nineteenpay.js';

export interface ReconcilerOptions {
  supabase: SupabaseClient;
  config: NineteenPayConfig;
  bridge: BossPayBridge;
  enabled: boolean;

  intervalMs?: number;
  windowMinutes?: number;
  minAgeSeconds?: number;
  backoffSeconds?: number;
  maxPerRun?: number;
  table?: string;
}

export interface ReconcilerHandle {
  stop: () => Promise<void>;
}

interface PendingRow {
  pg_transaction_id: string;
  txn_id: string;
  created_at: string;
  payment_status: string | null;
}

export function startNineteenPayReconciler(opts: ReconcilerOptions): ReconcilerHandle {
  const intervalMs = opts.intervalMs ?? 5_000;
  const windowMinutes = opts.windowMinutes ?? 15;
  const minAgeSeconds = opts.minAgeSeconds ?? 5;
  const backoffSeconds = opts.backoffSeconds ?? 10;
  const maxPerRun = opts.maxPerRun ?? 25;
  const table = opts.table ?? 'bosspay_txns';

  if (!opts.enabled) {
    console.log('[reconciler] nineteenpay disabled via RECONCILER_ENABLED=0');
    return { stop: async () => undefined };
  }

  console.log(
    `[reconciler] nineteenpay enabled poll=${Math.round(intervalMs / 1000)}s ` +
      `window=${windowMinutes}m minAge=${minAgeSeconds}s backoff=${backoffSeconds}s ` +
      `maxPerRun=${maxPerRun}`,
  );

  const inFlight = new Set<string>();
  let running = false;
  let stopped = false;
  let timer: NodeJS.Timeout | null = null;
  let activeTick: Promise<void> | null = null;

  async function tick(): Promise<void> {
    if (stopped || running) return;
    running = true;

    try {
      const now = Date.now();
      const windowStart = new Date(now - windowMinutes * 60_000).toISOString();
      const maxCreatedAt = new Date(now - minAgeSeconds * 1000).toISOString();
      const maxLastAttemptAt = new Date(now - backoffSeconds * 1000).toISOString();

      const { data, error } = await opts.supabase
        .from(table)
        .select('pg_transaction_id, txn_id, created_at, payment_status, reconcile_last_attempt_at')
        .eq('pg_type', 'nineteenpay')
        .is('callback_forwarded_at', null)
        .gte('created_at', windowStart)
        .lte('created_at', maxCreatedAt)
        .order('created_at', { ascending: true })
        .limit(maxPerRun * 3);

      if (error) {
        console.warn('[reconciler] supabase select failed:', error.message);
        return;
      }

      const eligible: PendingRow[] = [];
      for (const row of data ?? []) {
        const lastAttempt =
          typeof row['reconcile_last_attempt_at'] === 'string'
            ? row['reconcile_last_attempt_at']
            : null;
        if (lastAttempt && lastAttempt > maxLastAttemptAt) continue;
        if (inFlight.has(row['pg_transaction_id'] as string)) continue;

        const status = (row['payment_status'] as string | null) ?? null;
        if (status && status !== 'pending') continue;

        eligible.push({
          pg_transaction_id: row['pg_transaction_id'] as string,
          txn_id: row['txn_id'] as string,
          created_at: row['created_at'] as string,
          payment_status: status,
        });
        if (eligible.length >= maxPerRun) break;
      }

      if (!eligible.length) return;

      console.log(`[reconciler] tick picked ${eligible.length} row(s) to reconcile`);
      await Promise.all(eligible.map((row) => reconcileOne(row)));
    } catch (err) {
      console.error(
        '[reconciler] tick threw:',
        err instanceof Error ? err.message : JSON.stringify(err),
      );
    } finally {
      running = false;
    }
  }

  async function reconcileOne(row: PendingRow): Promise<void> {
    const pgTxnId = row.pg_transaction_id;
    inFlight.add(pgTxnId);
    const nowIso = new Date().toISOString();

    try {
      await stampAttempt(pgTxnId, nowIso);

      const clientTxnId = pgTxnId.startsWith('np_') || pgTxnId.startsWith('sp_') ? pgTxnId.replace(/^.*_/, '') : pgTxnId;
      let parsed: any;
      try {
        parsed = await queryNineteenPayStatus(opts.config, clientTxnId);
      } catch (err) {
        const msg = err instanceof Error ? err.message : JSON.stringify(err);
        console.warn(`[reconciler] ${pgTxnId} status-api failed: ${msg}`);
        return;
      }

      const status = resolveNineteenPayStatus(parsed.status);
      const amountRupees = Number(parsed.amount) || 0;
      const amountPaisa = Math.max(0, Math.round(amountRupees * 100));

      console.log(
        `[reconciler] ${pgTxnId} poll → status=${status} amountRupees=${amountRupees}`,
      );

      if (status === 'pending') {
        return;
      }

      const { error: updErr } = await opts.supabase
        .from(opts.table ?? 'bosspay_txns')
        .update({
          payment_status: status,
          amount_paisa: amountPaisa,
          gateway_payload: { source: 'reconciler_poll', parsed },
          updated_at: new Date().toISOString(),
        })
        .eq('pg_transaction_id', pgTxnId);
      if (updErr) {
        console.warn(`[reconciler] ${pgTxnId} row update failed: ${updErr.message}`);
      }

      let forwardHttpStatus: number | null = null;
      let forwardedAt: string | null = null;
      try {
        // Match the webhook handler: merchant-facing `pg_transaction_id` is the
        // 19Pay-side reference (transactionId / upi_transaction_id), while the
        // route param `pgTransactionId` stays as our internal BossPay UUID.
        const merchantFacingPgRef =
          (typeof parsed?.transactionId === 'string' && parsed.transactionId.trim()) ||
          (typeof parsed?.upi_transaction_id === 'string' && parsed.upi_transaction_id.trim()) ||
          pgTxnId;
        const result = await opts.bridge.forwardCallback({
          pgType: 'nineteenpay',
          pgTransactionId: pgTxnId,
          payload: {
            status,
            pg_transaction_id: merchantFacingPgRef,
            amount: amountPaisa,
            metadata: parsed,
          },
        });
        forwardHttpStatus = result.status;
        if (result.status >= 200 && result.status < 300) {
          forwardedAt = new Date().toISOString();
        }
        console.log(
          `[reconciler] ${pgTxnId} forwardCallback → HTTP ${result.status} ` +
            `(attempts=${result.attempts})`,
        );
      } catch (err) {
        console.error(
          `[reconciler] ${pgTxnId} forwardCallback threw:`,
          err instanceof Error ? err.message : JSON.stringify(err),
        );
      }

      const stampPayload: Record<string, unknown> = {
        callback_forward_http_status: forwardHttpStatus,
        updated_at: new Date().toISOString(),
      };
      if (forwardedAt) {
        stampPayload['callback_forwarded_at'] = forwardedAt;
      }
      const { error: stampErr } = await opts.supabase
        .from(opts.table ?? 'bosspay_txns')
        .update(stampPayload)
        .eq('pg_transaction_id', pgTxnId);
      if (stampErr) {
        console.warn(`[reconciler] ${pgTxnId} stamp update failed: ${stampErr.message}`);
      }
    } catch (err) {
      console.error(
        `[reconciler] ${pgTxnId} reconcileOne threw:`,
        err instanceof Error ? err.message : JSON.stringify(err),
      );
    } finally {
      inFlight.delete(pgTxnId);
    }
  }

  async function stampAttempt(pgTxnId: string, nowIso: string): Promise<void> {
    const { data, error } = await opts.supabase
      .from(opts.table ?? 'bosspay_txns')
      .select('reconcile_attempts')
      .eq('pg_transaction_id', pgTxnId)
      .maybeSingle();

    const prev = Number(data?.['reconcile_attempts'] ?? 0);
    if (error) {
      console.warn(`[reconciler] ${pgTxnId} attempt-read failed: ${error.message}`);
    }

    const { error: updErr } = await opts.supabase
      .from(opts.table ?? 'bosspay_txns')
      .update({
        reconcile_last_attempt_at: nowIso,
        reconcile_attempts: prev + 1,
      })
      .eq('pg_transaction_id', pgTxnId);
    if (updErr) {
      console.warn(`[reconciler] ${pgTxnId} attempt-update failed: ${updErr.message}`);
    }
  }

  timer = setInterval(() => {
    if (stopped) return;
    activeTick = tick();
  }, intervalMs);

  setTimeout(() => {
    if (!stopped) activeTick = tick();
  }, 1_000);

  return {
    stop: async () => {
      stopped = true;
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      if (activeTick) {
        try {
          await activeTick;
        } catch {
        }
      }
      console.log('[reconciler] nineteenpay stopped');
    },
  };
}
