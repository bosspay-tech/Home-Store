import "./env.js";
import express, { type Request, type Response } from "express";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { existsSync } from "node:fs";
import {
  createBossPayBridge,
  toExpress,
  SupabaseTxnStore,
  type BridgeHandlers,
  type CollectRequest,
  type CollectResult,
  type StatusRequest,
  type StatusResult,
} from "@bosspay/bridge-node";
import { createClient } from "@supabase/supabase-js";
import { createNineteenPayHandlers } from "./handlers.js";
import {
  verifyNineteenPayWebhook,
  resolveNineteenPayStatus,
  signRequest,
  buildHeaders,
  toNineteenPayRef,
  fromNineteenPayRef,
  type NineteenPayConfig,
} from "./nineteenpay.js";
import { startNineteenPayReconciler } from "./reconciler.js";
import {
  initiateEasebuzzPayment,
  retrieveEasebuzzTransaction,
  normalizeEasebuzzStatusResponse,
  resolveEasebuzzStatus,
  type EasebuzzConfig,
} from "./easebuzz.js";
import {
  resolveBridgePublicUrl,
  resolveStorefrontUrl,
} from "./public-url.js";

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

const EASEBUZZ_KEY = process.env.EASEBUZZ_KEY;
const EASEBUZZ_SALT = process.env.EASEBUZZ_SALT;
const EASEBUZZ_URL =
  process.env.EASEBUZZ_URL ?? "https://pay.easebuzz.in";
const EASEBUZZ_STATUS_URL =
  process.env.EASEBUZZ_STATUS_URL ??
  "https://dashboard.easebuzz.in/transaction/v2.1/retrieve";
const easebuzzConfig: EasebuzzConfig | null =
  EASEBUZZ_KEY && EASEBUZZ_SALT
    ? {
        key: EASEBUZZ_KEY,
        salt: EASEBUZZ_SALT,
        payBaseUrl: EASEBUZZ_URL,
        statusUrl: EASEBUZZ_STATUS_URL,
      }
    : null;

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

// NineteenPay handlers, keyed by `pg_type` (this is what the bridge dispatches
// `/bosspay/v1/*` on and what `/health` reports as `enabled_pgs`).
const handlers: BridgeHandlers = {
  ...createNineteenPayHandlers(nineteenPayConfig, BRIDGE_BASE_URL!, supabaseClient),
};

// ── Easebuzz, registered as a first-class bridge PG (additive) ─────────
// Without this, DollerpayX's `/bosspay/v1/collect` for `pg_type=easebuzz`
// gets `PG_NOT_CONFIGURED` and `/health` only lists `nineteenpay`.
//
// Ops decision: the lender bridge stays LIGHT. It only calls Easebuzz
// `initiateLink` (which needs the key/salt that live on this host) and returns
// the payment LINK. DollerpayX mints the `upi://` deeplink from that link on
// its own servers (Easebuzz has no IP allow-list). So `createCollection` does
// NOT run `submitInitiatePayment` here.
//
// The existing `/api/easebuzz/*` storefront routes and the 19Pay path are
// unchanged — this only adds a new key to the dispatch map.
if (easebuzzConfig) {
  const ezbConfig = easebuzzConfig;
  handlers.easebuzz = {
    createCollection: async (req: CollectRequest): Promise<CollectResult> => {
      const txnid = req.txn_id;
      const amountRupees = req.amount / 100; // DPX sends paisa; Easebuzz wants rupees
      const email =
        req.customer_email && req.customer_email.includes("@")
          ? req.customer_email
          : "customer@dollerpayx.in";
      const phone =
        (req.customer_phone || "").replace(/\D/g, "").slice(-10) || "9999999999";
      const firstname =
        req.customer_email?.split("@")[0]?.trim() || "Customer";

      // surl/furl reuse the existing storefront return handler so the hosted-page
      // fallback keeps working; the authoritative status path is webhook + retrieve.
      const surl = `${BRIDGE_BASE_URL}/api/easebuzz/return?outcome=success`;
      const furl = `${BRIDGE_BASE_URL}/api/easebuzz/return?outcome=failed`;

      const result = await initiateEasebuzzPayment(ezbConfig, {
        txnid,
        amount: amountRupees,
        productinfo: `Order ${txnid}`,
        firstname,
        email,
        phone,
        surl,
        furl,
        udf1: txnid,
      });

      // Return only the Easebuzz payment LINK — DollerpayX mints the deeplink.
      return {
        payment_url: result.checkoutUrl,
        pg_transaction_id: txnid,
        mode: "redirect",
      };
    },

    checkStatus: async (req: StatusRequest): Promise<StatusResult> => {
      const result = await retrieveEasebuzzTransaction(ezbConfig, req.pg_txn_id);
      const normalized = normalizeEasebuzzStatusResponse(result, req.pg_txn_id);
      if (!normalized.success || !normalized.data.length) {
        return { status: "pending", pg_transaction_id: req.pg_txn_id, amount: 0 };
      }
      const row = normalized.data[0] as {
        status?: string;
        amount?: unknown;
        raw?: Record<string, unknown>;
      };
      const amountPaisa = Math.max(0, Math.round(Number(row.amount ?? 0) * 100));
      return {
        status: resolveEasebuzzStatus(String(row.status ?? "")),
        pg_transaction_id: req.pg_txn_id,
        amount: amountPaisa,
        ...(row.raw ? { raw_pg_response: row.raw } : {}),
      };
    },

    isAvailable: async () => true,
  };
}

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

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/**
 * Resolve our canonical BossPay UUID for an inbound 19Pay webhook.
 *
 * Lookup order (per `.cursor/rules/bosspay-context.mdc` -- PG identifier
 * contract):
 *   1. `provider_txn_id = payload.transactionId` (primary; the value 19Pay
 *      gave us at /collect, echoed verbatim in every webhook)
 *   2. Strict UUID form of the payload's `collect_ref` (legacy callers that
 *      sent the 32-hex form intact)
 *   3. 30-hex prefix from 19Pay's truncated `orderId` (`YYYYMMDDHHMMSS` +
 *      first 30 hex of our UUID; fallback for rows that pre-date the
 *      provider_txn_id migration)
 */
async function resolveClientTxnId(
  payload: any,
  rawRef: string,
): Promise<string | null> {
  const providerTxnId =
    typeof payload?.transactionId === "string"
      ? payload.transactionId.trim()
      : "";

  if (providerTxnId) {
    const { data, error } = await supabaseClient
      .from("bosspay_txns")
      .select("pg_transaction_id")
      .eq("provider_txn_id", providerTxnId)
      .maybeSingle();
    if (error) {
      console.warn(
        "[nineteenpay-callback] provider_txn_id lookup failed:",
        error.message,
      );
    } else if (data?.["pg_transaction_id"]) {
      return data["pg_transaction_id"] as string;
    }
  }

  const mapped = fromNineteenPayRef(rawRef);
  if (UUID_RE.test(mapped)) {
    return mapped;
  }

  const r = (rawRef || "").replace(/-/g, "").toLowerCase();
  if (/^\d{14}[0-9a-f]{30}$/.test(r)) {
    const hex30 = r.slice(14);
    const dashed =
      `${hex30.slice(0, 8)}-${hex30.slice(8, 12)}-${hex30.slice(12, 16)}-` +
      `${hex30.slice(16, 20)}-${hex30.slice(20)}`;
    const { data, error } = await supabaseClient
      .from("bosspay_txns")
      .select("pg_transaction_id")
      .ilike("pg_transaction_id", `${dashed}%`)
      .limit(2);
    if (error) {
      console.warn(
        "[nineteenpay-callback] prefix lookup failed:",
        error.message,
      );
    } else if (data && data.length === 1) {
      return data[0]["pg_transaction_id"] as string;
    } else if (data && data.length > 1) {
      console.error(
        "[nineteenpay-callback] ambiguous 30-hex prefix match:",
        dashed,
      );
    }
  }

  return null;
}

async function handleNineteenPayCallback(req: Request, res: Response) {
  try {
    console.log(
      `[nineteenpay-callback] inbound ${req.method} ${req.originalUrl} from ${req.ip}`,
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

    const rawRef =
      payload.collect_ref ||
      payload.collectRef ||
      payload.orderId ||
      payload.orderEd ||
      req.params["txnId"] ||
      "";

    // Primary: provider_txn_id (19Pay's `transactionId` from /collect, echoed
    // verbatim in every webhook). Falls back to UUID form, then 30-hex prefix.
    const clientTxnId = await resolveClientTxnId(payload, rawRef);
    const status = resolveNineteenPayStatus(payload.status);

    const amountRupees = Number(payload.amount ?? 0);
    const amountPaisa = Math.max(0, Math.round(amountRupees * 100));

    if (!clientTxnId) {
      console.error(
        "[nineteenpay-callback] could not resolve clientTxnId from payload",
        {
          providerTxnId: payload?.transactionId ?? null,
          rawRef,
        },
      );
      res
        .status(400)
        .send("Could not resolve transaction id from 19Pay callback.");
      return;
    }

    const pgTxnId = clientTxnId;

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

    // Merchant-facing PG reference: prefer 19Pay's `transactionId` (the value
    // they return at /collect, persisted as `provider_txn_id`, echoed in every
    // webhook). This is the id merchants quote in support / reconciliation; the
    // route param `pgTransactionId` stays as our internal BossPay UUID for
    // routing in BossPay's `/api/callbacks/nineteenpay/:txnId`.
    const merchantFacingPgRef =
      (typeof payload?.transactionId === "string" && payload.transactionId.trim()) ||
      (typeof payload?.upi_transaction_id === "string" && payload.upi_transaction_id.trim()) ||
      pgTxnId;

    console.log(
      `[nineteenpay-callback] forwarding via bridge for ${pgTxnId} ` +
        `(pg_ref=${merchantFacingPgRef})`,
    );

    const result = await bridge.forwardCallback({
      pgType: "nineteenpay",
      pgTransactionId: pgTxnId,
      payload: {
        status,
        pg_transaction_id: merchantFacingPgRef,
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
    console.error(
      "[nineteenpay-callback] error:",
      err instanceof Error ? err.message : JSON.stringify(err),
    );
    return res.status(500).send("Error processing payment callback.");
  }
}

// ════════════════════════════════════════════════════════════════════
// BossPay bridge routes
// ════════════════════════════════════════════════════════════════════

// We need raw bodies for webhook verification and for bridge-node HMAC (see toExpress readRawBody).
app.use((req, res, next) => {
  const isNineteenPayCallback =
    req.path.includes("callback/nineteenpay") ||
    req.path.includes("/payment-webhook") ||
    req.path.includes("/webhooks/nineteenpay");

  const isBridgeRoute = req.path.includes("/bosspay/v1/");
  const isEasebuzzReturn = req.path === "/api/easebuzz/return";

  if (isEasebuzzReturn) {
    express.urlencoded({ extended: true, limit: "1mb" })(req, res, next);
  } else if (isNineteenPayCallback || isBridgeRoute) {
    // bridge-node needs raw bytes for HMAC; putting express.json() in front
    // hangs readRawBody forever (stream already consumed), which manifests
    // upstream as a Headers Timeout Error after ~8s.
    express.raw({ type: "*/*", limit: "1mb" })(req, res, next);
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
// GET probes from ops / PG-support / 19Pay onboarding checks — keep short so
// the SPA static handler (further down) cannot swallow them with index.html.
app.get("/api/payment-webhook", (_req, res) => {
  res.type("text/plain").status(200).send("19pay webhook alive");
});
app.get("/webhooks/nineteenpay", (_req, res) => {
  res.type("text/plain").status(200).send("19pay webhook alive");
});

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

async function handleEasebuzzCreatePayment(req: Request, res: Response) {
  if (!easebuzzConfig) {
    res.status(503).json({
      success: false,
      error: "Easebuzz is not configured (EASEBUZZ_KEY, EASEBUZZ_SALT)",
    });
    return;
  }

  const {
    amount,
    collect_ref,
    display_name,
    txn_note,
    user_ref,
    email,
    phone,
    productinfo,
    surl,
    furl,
    address1,
    city,
    state,
    country,
    zipcode,
  } = req.body ?? {};

  if (!amount || Number(amount) <= 0) {
    res.status(400).json({ success: false, error: "Invalid amount" });
    return;
  }

  const txnid = String(collect_ref || `ORD${Date.now()}`);
  const firstname = String(display_name || "Customer").trim();
  const customerEmail = String(email || "").trim();
  const customerPhone = String(phone || user_ref || "").trim();

  if (!customerEmail) {
    res.status(400).json({ success: false, error: "Customer email is required" });
    return;
  }
  if (!customerPhone) {
    res.status(400).json({ success: false, error: "Customer phone is required" });
    return;
  }

  // Easebuzz POSTs form data to surl/furl — must hit the bridge, not the Vite SPA.
  const bridgePublicUrl = resolveBridgePublicUrl(req, PORT);
  const successUrl =
    surl || `${bridgePublicUrl}/api/easebuzz/return?outcome=success`;
  const failureUrl =
    furl || `${bridgePublicUrl}/api/easebuzz/return?outcome=failed`;

  console.log(
    `[easebuzz-create] txnid=${txnid} surl=${successUrl} furl=${failureUrl}`,
  );

  const result = await initiateEasebuzzPayment(easebuzzConfig, {
    txnid,
    amount: Number(amount),
    productinfo: productinfo || txn_note || `Order ${txnid}`,
    firstname,
    email: customerEmail,
    phone: customerPhone,
    surl: successUrl,
    furl: failureUrl,
    udf1: txnid,
    address1: address1 || undefined,
    city: city || undefined,
    state: state || undefined,
    country: country || "India",
    zipcode: zipcode || undefined,
  });

  res.json({
    success: true,
    checkoutUrl: result.checkoutUrl,
    transactionId: result.accessKey,
    collectRef: result.txnid,
  });
}

async function handleEasebuzzPaymentStatus(req: Request, res: Response) {
  if (!easebuzzConfig) {
    res.status(503).json({
      success: false,
      error: "Easebuzz is not configured (EASEBUZZ_KEY, EASEBUZZ_SALT)",
    });
    return;
  }

  const { collect_refs, txnid } = req.body ?? {};
  const refs = Array.isArray(collect_refs)
    ? collect_refs
    : txnid
      ? [txnid]
      : [];

  if (!refs.length) {
    res.status(400).json({
      success: false,
      error: "collect_refs array or txnid is required",
    });
    return;
  }

  const primaryTxnId = String(refs[0]);
  const result = await retrieveEasebuzzTransaction(easebuzzConfig, primaryTxnId);
  const normalized = normalizeEasebuzzStatusResponse(result, primaryTxnId);

  res.status(normalized.success ? 200 : 404).json(normalized);
}

app.post("/api/easebuzz/create-payment", async (req, res) => {
  try {
    await handleEasebuzzCreatePayment(req, res);
  } catch (err) {
    console.error("easebuzz create-payment error:", err);
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : "Internal server error",
    });
  }
});

app.post("/api/easebuzz/payment-status", async (req, res) => {
  try {
    await handleEasebuzzPaymentStatus(req, res);
  } catch (err) {
    console.error("easebuzz payment-status error:", err);
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : "Internal server error",
    });
  }
});

async function handleNineteenPayCreatePayment(req: Request, res: Response) {
  const {
    amount,
    collect_ref,
    display_name,
    txn_note,
    idempotency_key,
    user_ref,
  } = req.body ?? {};

  if (!amount || Number(amount) <= 0) {
    res.status(400).json({ success: false, error: "Invalid amount" });
    return;
  }

  const body: Record<string, unknown> = { amount: Number(amount) };
  if (collect_ref) body.collect_ref = toNineteenPayRef(String(collect_ref));
  if (display_name) body.display_name = display_name;
  if (txn_note) body.txn_note = txn_note;

  let rawRef = String(user_ref || "").replace(/[^a-zA-Z0-9]/g, "");
  if (rawRef.length < 5) {
    rawRef = String(collect_ref || "").replace(/[^a-zA-Z0-9]/g, "");
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
  let data: Record<string, any>;
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
    res.status(400).json({ success: false, error: data.raw.error });
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
    collectRef: data.collectRef ?? collect_ref,
    gateway: "nineteenpay",
  });
}

async function handleNineteenPayPaymentStatus(req: Request, res: Response) {
  const { collect_refs } = req.body ?? {};

  if (!collect_refs || !Array.isArray(collect_refs) || !collect_refs.length) {
    res
      .status(400)
      .json({ success: false, error: "collect_refs array required" });
    return;
  }

  const body = {
    collect_ref_or: (collect_refs as string[]).map((r) => toNineteenPayRef(r)),
  };
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
}

function handleEasebuzzReturn(req: Request, res: Response) {
  const body = (req.body ?? {}) as Record<string, string>;
  const query = req.query as Record<string, string>;
  const txnid =
    body.txnid || body.udf1 || query.txnid || query.collect_ref || "";
  const pgStatus = (body.status || "").toLowerCase();
  const failed =
    query.outcome === "failed" ||
    pgStatus === "failure" ||
    pgStatus === "failed" ||
    pgStatus === "usercancelled";

  const params = new URLSearchParams({
    gateway: "easebuzz",
  });
  if (txnid) {
    params.set("collect_ref", txnid);
    params.set("txnid", txnid);
  }
  if (failed) {
    params.set("status", "failed");
  }

  const storefrontUrl = resolveStorefrontUrl(req);
  const redirectUrl = `${storefrontUrl}/order-success?${params}`;
  console.log(`[easebuzz-return] txnid=${txnid} redirect=${redirectUrl}`);
  res.redirect(302, redirectUrl);
}

app.post("/api/nineteenpay/create-payment", async (req, res) => {
  try {
    await handleNineteenPayCreatePayment(req, res);
  } catch (err) {
    console.error("nineteenpay create-payment error:", err);
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : "Internal server error",
    });
  }
});

app.post("/api/nineteenpay/payment-status", async (req, res) => {
  try {
    await handleNineteenPayPaymentStatus(req, res);
  } catch (err) {
    console.error("nineteenpay payment-status error:", err);
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : "Internal server error",
    });
  }
});

app.post("/api/easebuzz/return", handleEasebuzzReturn);
app.get("/api/easebuzz/return", handleEasebuzzReturn);

// ── Serve storefront equivalent directly if running within HomeStore ──
// If the bridge is replacing server.js entirely, you can serve dist here:
const __dirname = dirname(fileURLToPath(import.meta.url));
const distPath = join(__dirname, "..", "..", "dist"); // Bridge is in bridge/src/
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("/{*catchAll}", (_req, res) => {
    res.sendFile(join(distPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Bridge server running on port ${PORT}`);
});
