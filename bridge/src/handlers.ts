import type { BridgeHandlers } from '@bosspay/bridge-node';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  createNineteenPayCollect,
  queryNineteenPayStatus,
  resolveNineteenPayStatus,
  type NineteenPayConfig,
} from './nineteenpay.js';
import { randomCustomerProfile } from './customer-pool.js';

// In-memory store for pending payments is no longer heavily needed since 19Pay
// directly gives us a checkoutUrl. Kept empty if needed for extending.

/**
 * Upsert `gateway_payload` on the bosspay_txns row.
 */
async function persistGatewayPayload(
  supabase: SupabaseClient,
  clientTxnId: string,
  paymentEntry: any,
): Promise<void> {
  const delays = [100, 250, 500, 1000];
  for (let i = 0; i < delays.length; i += 1) {
    await new Promise((r) => setTimeout(r, delays[i]));
    try {
      const { data, error } = await supabase
        .from('bosspay_txns')
        .update({
          gateway_payload: paymentEntry,
          updated_at: new Date().toISOString(),
        })
        .eq('pg_transaction_id', clientTxnId)
        .select('pg_transaction_id');
      if (error) {
        console.warn('[nineteenpay-createCollection] persist error:', error.message);
        continue;
      }
      if (data && data.length > 0) {
        console.log('[nineteenpay-createCollection] Supabase persist ok:', clientTxnId);
        return;
      }
    } catch (err) {
      console.warn('[nineteenpay-createCollection] persist threw:', err);
    }
  }
  console.warn(
    `[nineteenpay-createCollection] gave up persisting gateway_payload for ${clientTxnId}.`,
  );
}

export function createNineteenPayHandlers(
  config: NineteenPayConfig,
  _bridgeBaseUrl: string,
  supabase: SupabaseClient,
): BridgeHandlers {
  return {
    nineteenpay: {
      createCollection: async (req) => {
        const clientTxnId = req.txn_id;
        const amountRupees = req.amount / 100;
        const payer = randomCustomerProfile();

        console.log('[nineteenpay-createCollection] txn_id=', req.txn_id);
        console.log('[nineteenpay-createCollection] clientTxnId=', clientTxnId);
        console.log('[nineteenpay-createCollection] amountRupees=', amountRupees);
        console.log(
          `[nineteenpay-createCollection] payer name="${payer.fullName}" mobile=${payer.mobile}`,
        );

        let result;
        try {
          result = await createNineteenPayCollect(config, {
            amount: amountRupees,
            collectRef: clientTxnId,
            userRef: payer.mobile,
            displayName: payer.fullName,
            txnNote: `Order ${clientTxnId}`,
            idempotencyKey: clientTxnId,
          });
        } catch (err) {
          console.error('[nineteenpay-createCollection] failed to create payment via 19Pay:', err);
          throw err;
        }

        const paymentEntry = {
          checkoutUrl: result.checkoutUrl,
          transactionId: result.transactionId,
          collectRef: result.collectRef,
        };

        persistGatewayPayload(supabase, clientTxnId, paymentEntry).catch((err) => {
          console.warn('[nineteenpay-createCollection] Supabase persist gave up:', err);
        });

        console.log(
          '[nineteenpay-createCollection] payment_url=', result.checkoutUrl,
        );

        return {
          payment_url: result.checkoutUrl,
          pg_transaction_id: clientTxnId,
          mode: 'redirect' as const,
        };
      },

      checkStatus: async (req) => {
        const clientTxnId = req.pg_txn_id.replace(/^sp_/, '');

        console.log(
          `[checkStatus] pg_txn_id=${req.pg_txn_id} → clientTxnId=${clientTxnId}`,
        );

        try {
          const statusResp = await queryNineteenPayStatus(config, clientTxnId);
          const resolvedStatus = resolveNineteenPayStatus(statusResp.status);

          const rawAmount = statusResp.amount || '0';
          const amountRupees = Number.parseFloat(rawAmount);
          const amountPaisa =
            Number.isFinite(amountRupees) && amountRupees >= 0
              ? Math.round(amountRupees * 100)
              : 0;

          console.log(
            `[checkStatus] via status API → clientTxnId=${clientTxnId} ` +
            `status=${resolvedStatus} amount=${amountRupees}₹`,
          );

          try {
            await supabase
              .from('bosspay_txns')
              .update({
                payment_status: resolvedStatus,
                amount_paisa: amountPaisa,
                gateway_payload: { source: 'status_api', parsed: statusResp },
                updated_at: new Date().toISOString(),
              })
              .eq('pg_transaction_id', clientTxnId);
          } catch (cacheErr) {
            console.warn('[checkStatus] cache mirror failed:', cacheErr);
          }

          return {
            status: resolvedStatus,
            pg_transaction_id: req.pg_txn_id,
            amount: amountPaisa,
          };
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : String(err);
          console.warn(
            `[checkStatus] status API unavailable for ${clientTxnId} — ` +
            `falling back to cached callback data. Reason: ${errMsg}`,
          );
        }

        try {
          const { data, error } = await supabase
            .from('bosspay_txns')
            .select('payment_status, amount_paisa')
            .eq('pg_transaction_id', clientTxnId)
            .maybeSingle();

          if (error) {
            console.warn(
              `[checkStatus] Supabase read failed for ${clientTxnId}:`,
              error.message,
            );
          }

          const cachedStatus =
            data?.payment_status === 'success' ||
            data?.payment_status === 'failed' ||
            data?.payment_status === 'pending'
              ? data.payment_status
              : 'pending';

          const cachedAmountRaw = Number(data?.amount_paisa ?? 0);
          const cachedAmount =
            Number.isFinite(cachedAmountRaw) && cachedAmountRaw >= 0
              ? Math.round(cachedAmountRaw)
              : 0;

          console.log(
            `[checkStatus] via cache → clientTxnId=${clientTxnId} ` +
            `status=${cachedStatus} amount_paisa=${cachedAmount}`,
          );

          return {
            status: cachedStatus,
            pg_transaction_id: req.pg_txn_id,
            amount: cachedAmount,
          };
        } catch (err) {
          console.error(
            `[checkStatus] cache read threw for ${clientTxnId}:`,
            err,
          );
          return {
            status: 'pending' as const,
            pg_transaction_id: req.pg_txn_id,
            amount: 0,
          };
        }
      },

      isAvailable: async () => true,
    },
  };
}
