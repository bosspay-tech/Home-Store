import express, { type Request, type Response } from "express";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { existsSync } from "node:fs";
import {
  createBossPayBridge,
  toExpress,
  SupabaseTxnStore,
} from "@bosspay/bridge-node";
import { createClient } from "@supabase/supabase-js";
import { createNineteenPayHandlers } from "./handlers.js";
import {
  createNineteenPayCollect,
  queryNineteenPayStatus,
  verifyNineteenPayWebhook,
  resolveNineteenPayStatus,
  signRequest,
  buildHeaders,
  type NineteenPayConfig,
} from "./nineteenpay.js";
import { startNineteenPayReconciler } from "./reconciler.js";

// ── Environment ────────────────────────────────────────────────────
const PORT = Number(process.env.PORT ?? 3000);
const BRIDGE_SECRET = process.env.BOSSPAY_BRIDGE_SECRET;
const BRIDGE_BASE_URL = process.env.BRIDGE_BASE_URL;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const NP_KEY = process.env.NP_KEY;
const NP_SALT = process.env.NP_SALT;
const NP_WEBHOOK_SECRET = process.env.NP_WEBHOOK_SECRET;
const NP_API_BASE = process.env.NP_API_BASE ?? "https://nineteenapis.online";

// ── Validate required env vars exist ───────────────────────────────
const missing = (
  [
    ["BOSSPAY_BRIDGE_SECRET", BRIDGE_SECRET],
    ["BRIDGE_BASE_URL", BRIDGE_BASE_URL],
    ["SUPABASE_URL", SUPABASE_URL],
    ["SUPABASE_SERVICE_ROLE_KEY", SUPABASE_SERVICE_ROLE_KEY],
    ["NP_KEY", NP_KEY],
    ["NP_SALT", NP_SALT],
    ["NP_WEBHOOK_SECRET", NP_WEBHOOK_SECRET],
  ] as const
)
  .filter(([, v]) => !v)
  .map(([k]) => k);

if (missing.length) {
  console.error(`Missing required env vars: ${missing.join(", ")}`);
  process.exit(1);
}

// ── Supabase client (server-side, service role) ────────────────────
const supabaseClient = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const txnStore = new SupabaseTxnStore({ client: supabaseClient });

// ── NineteenPay config ────────────────────────────────────────────────
const nineteenPayConfig: NineteenPayConfig = {
  apiKey: NP_KEY!,
  salt: NP_SALT!,
  webhookSecret: NP_WEBHOOK_SECRET!,
  apiBase: NP_API_BASE!,
};

const handlers = createNineteenPayHandlers(
  nineteenPayConfig,
  BRIDGE_BASE_URL!,
  supabaseClient,
);

// ── BossPay Bridge ─────────────────────────────────────────────────
const bridge = createBossPayBridge({
  bridgeSecret: BRIDGE_SECRET!,
  bosspayApiBase: "https://api.bosspay24.com", // or env BOSSPAY_API_BASE
  handlers,
  txnStore,
  version: "1.0.0",
});

// ── 19Pay callback-miss reconciler ──────────────────────────────
const reconciler = startNineteenPayReconciler({
  supabase: supabaseClient,
  config: nineteenPayConfig,
  bridge,
  enabled: process.env.NINETEENPAY_RECONCILER_ENABLED !== "0",
});

for (const sig of ["SIGTERM", "SIGINT"] as const) {
  process.once(sig, () => {
    void reconciler.stop().finally(() => process.exit(0));
  });
}

// ── Express app ────────────────────────────────────────────────────
const app = express();

// ── Bridge handler ─────────────────────────────────────────────────
const bridgeHandler = toExpress({
  ctx: {
    handlers,
    txnStore,
    bosspayApiBase: "https://api.bosspay24.com",
    version: "1.0.0",
  },
  bridgeSecret: BRIDGE_SECRET!,
});

// ── 19Pay callback handler ──────────────────────────────────────
async function handleNineteenPayCallback(req: Request, res: Response) {
  try {
    console.log(
      `[nineteenpay-callback] inbound ${req.method} ${req.originalUrl}`,
    );

    const timestamp = (req.headers["x-tsp-timestamp"] as string) || "";
    const signature = (req.headers["x-tsp-signature"] as string) || "";
    const rawBody = req.body.toString("utf8");

    const { valid, payload } = verifyNineteenPayWebhook(
      nineteenPayConfig,
      timestamp,
      signature,
      rawBody,
    );

    if (!valid) {
      console.error("Webhook signature verification failed");
      return res.status(401).send("Invalid signature");
    }

    console.log("Webhook payload:", payload);

    const clientTxnId =
      payload.collect_ref ||
      payload.collectRef ||
      payload.orderEd ||
      req.params["txnId"] ||
      "";
    const status = resolveNineteenPayStatus(payload.status);

    const amountRupees = Number(payload.amount ?? 0);
    const amountPaisa = Math.max(0, Math.round(amountRupees * 100));

    let pgTxnId = clientTxnId;

    if (!pgTxnId) {
      res.status(400).send("Missing pg transaction id in 19Pay callback.");
      return;
    }

    console.log(
      `[nineteenpay-callback] pgTxnId=${pgTxnId} status=${status} amountPaisa=${amountPaisa}`,
    );

    const { data: existing, error: existingError } = await supabaseClient
      .from("bosspay_txns")
      .select("payment_status, amount_paisa, callback_forwarded_at")
      .eq("pg_transaction_id", pgTxnId)
      .maybeSingle();

    if (existingError) {
      console.error(
        "[nineteenpay-callback] failed to read existing txn row:",
        existingError,
      );
    }

    const alreadyForwarded =
      !!existing?.callback_forwarded_at &&
      existing?.payment_status === status &&
      Number(existing?.amount_paisa ?? 0) === amountPaisa;

    await supabaseClient
      .from("bosspay_txns")
      .update({
        payment_status: status,
        amount_paisa: amountPaisa,
        gateway_payload: { source: "webhook", parsed: payload },
        updated_at: new Date().toISOString(),
      })
      .eq("pg_transaction_id", pgTxnId);

    if (alreadyForwarded) {
      console.log(
        `[nineteenpay-callback] duplicate callback ignored for ${pgTxnId}`,
      );
      res.json({ received: true, duplicate: true });
      return;
    }

    if (status === "pending") {
      console.warn(
        `[nineteenpay-callback] ambiguous/pending callback for ${pgTxnId}; ` +
          `not forwarding to BossPay yet`,
      );
      res.json({ received: true, forwarded: false });
      return;
    }

    console.log(`[nineteenpay-callback] forwarding via bridge for ${pgTxnId}`);

    const result = await bridge.forwardCallback({
      pgType: "nineteenpay",
      pgTransactionId: pgTxnId,
      payload: {
        status,
        pg_transaction_id: pgTxnId,
        amount: amountPaisa,
        metadata: payload,
      },
    });

    console.log(
      `[nineteenpay-callback] BossPay response: HTTP ${result.status} ` +
        `(attempts=${result.attempts}) body=${result.body}`,
    );

    await supabaseClient
      .from("bosspay_txns")
      .update({
        callback_forward_http_status: result.status,
        callback_forwarded_at:
          result.status >= 200 && result.status < 300
            ? new Date().toISOString()
            : null,
        updated_at: new Date().toISOString(),
      })
      .eq("pg_transaction_id", pgTxnId);

    if (result.status < 200 || result.status >= 300) {
      console.error(
        `[nineteenpay-callback] BossPay callback failed for ${pgTxnId} ` +
          `with HTTP ${result.status}`,
      );
    }

    return res.json({
      received: true,
      forwarded: true,
      forwardStatus: result.status,
    });
  } catch (err) {
    console.error("[nineteenpay-callback] error:", err);
    return res.status(500).send("Error processing payment callback.");
  }
}

// ════════════════════════════════════════════════════════════════════
// BossPay bridge routes
// ════════════════════════════════════════════════════════════════════

// We need raw bodies for webhook verification
app.use((req, res, next) => {
  const isNineteenPayCallback =
    req.path.includes("callback/nineteenpay") ||
    req.path.includes("/payment-webhook") ||
    req.path.includes("/webhooks/nineteenpay");

  if (isNineteenPayCallback) {
    express.raw({ type: "application/json" })(req, res, next);
  } else {
    // Normal JSON parsing for api endpoints etc
    express.json({ limit: "1mb" })(req, res, next);
  }
});

// Intercept BossPay bridge routes early.
app.use((req, res, next) => {
  const isNineteenPayCallback =
    req.path.includes("callback/nineteenpay") ||
    req.path.includes("/payment-webhook") ||
    req.path.includes("/webhooks/nineteenpay");

  if (isNineteenPayCallback) return next();

  if (req.path.includes("/bosspay/v1/")) {
    console.log(`[bridge] ${req.method} ${req.path} → bridgeHandler`);
    return bridgeHandler(req, res, next);
  }

  next();
});

// ── Webhook routes ──
app.post("/api/payment-webhook", async (req, res) =>
  handleNineteenPayCallback(req, res),
);
app.post("/webhooks/nineteenpay", async (req, res) =>
  handleNineteenPayCallback(req, res),
);
app.post("/wp-json/bosspay/v1/callback/nineteenpay", async (req, res) =>
  handleNineteenPayCallback(req, res),
);
app.post("/wp-json/bosspay/v1/callback/nineteenpay/:txnId", async (req, res) =>
  handleNineteenPayCallback(req, res),
);

// ── Legacy Home-Store API routes (Frontend compatibility) ──

app.post("/api/create-payment", async (req, res) => {
  try {
    const {
      amount,
      collect_ref,
      display_name,
      txn_note,
      idempotency_key,
      user_ref,
    } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ success: false, error: "Invalid amount" });
      return;
    }

    const body: any = { amount: Number(amount) };
    if (collect_ref) body.collect_ref = collect_ref;
    if (display_name) body.display_name = display_name;
    if (txn_note) body.txn_note = txn_note;

    let rawRef = (user_ref || "").replace(/[^a-zA-Z0-9]/g, "");
    if (rawRef.length < 5) {
      rawRef = (collect_ref || "").replace(/[^a-zA-Z0-9]/g, "");
    }
    if (rawRef.length < 5) {
      rawRef = "guestuser";
    }
    body.payer = { user_ref: rawRef };

    const { signature, timestamp, nonce } = signRequest(
      nineteenPayConfig.apiKey,
      nineteenPayConfig.salt,
      body,
    );
    const headers = buildHeaders(
      nineteenPayConfig.apiKey,
      timestamp,
      nonce,
      signature,
      idempotency_key,
    );

    const url = `${nineteenPayConfig.apiBase}/api/v2/payments/nsdl/collect`;
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const responseText = await response.text();

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { message: responseText };
    }

    if (!response.ok || !data.success) {
      res.status(response.status).json({
        success: false,
        error: data.message || data.raw?.error || "Payment creation failed",
      });
      return;
    }

    if (data.raw?.error) {
      res.status(400).json({
        success: false,
        error: data.raw.error,
      });
      return;
    }

    const checkoutUrl = data.link || data.checkoutUrl;

    if (!checkoutUrl) {
      res.status(502).json({
        success: false,
        error: "No checkout URL returned from payment gateway",
      });
      return;
    }

    res.json({
      success: true,
      checkoutUrl,
      transactionId: data.transactionId,
      collectRef: data.collectRef,
    });
  } catch (err) {
    console.error("create-payment error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

app.post("/api/payment-status", async (req, res) => {
  try {
    const { collect_refs } = req.body;

    if (!collect_refs || !Array.isArray(collect_refs) || !collect_refs.length) {
      res
        .status(400)
        .json({ success: false, error: "collect_refs array required" });
      return;
    }

    const body = { collect_ref_or: collect_refs };
    const { signature, timestamp, nonce } = signRequest(
      nineteenPayConfig.apiKey,
      nineteenPayConfig.salt,
      body,
    );
    const headers = buildHeaders(
      nineteenPayConfig.apiKey,
      timestamp,
      nonce,
      signature,
    );

    const response = await fetch(
      `${nineteenPayConfig.apiBase}/api/v2/payments/nsdl/status`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      },
    );

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error("payment-status error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// ── Serve storefront equivalent directly if running within HomeStore ──
// If the bridge is replacing server.js entirely, you can serve dist here:
const __dirname = dirname(fileURLToPath(import.meta.url));
const distPath = join(__dirname, "..", "..", "dist"); // Bridge is in bridge/src/
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(join(distPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Bridge server running on port ${PORT}`);
});
