import express from "express";
import cors from "cors";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3000;

const NP_KEY = process.env.NP_KEY;
const NP_SALT = process.env.NP_SALT;
const NP_WEBHOOK_SECRET = process.env.NP_WEBHOOK_SECRET;
const NP_API_BASE =
  process.env.NP_API_BASE || "https://nineteenapis.online";

// ─── Middleware ──────────────────────────────────────────────────
app.use(cors());
app.use("/api/payment-webhook", express.raw({ type: "application/json" }));
app.use(express.json());

// ─── HMAC helpers ───────────────────────────────────────────────
function sortObject(obj) {
  const sorted = {};
  for (const key of Object.keys(obj).sort()) {
    sorted[key] = obj[key];
  }
  return sorted;
}

function signRequest(apiKey, salt, method, body) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(16).toString("hex");
const stringToSign = apiKey + timestamp + nonce + JSON.stringify(body);
  const signature = crypto
    .createHmac("sha256", salt)
    .update(stringToSign)
    .digest("hex");
  return { signature, timestamp, nonce };
}

function buildHeaders(apiKey, timestamp, nonce, signature, idempotencyKey) {
  const headers = {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
    "x-timestamp": timestamp,
    "x-nonce": nonce,
    "x-signature": signature,
  };
  if (idempotencyKey) headers["X-Idempotency-Key"] = idempotencyKey;
  return headers;
}

// ─── POST /api/create-payment ───────────────────────────────────
app.post("/api/create-payment", async (req, res) => {
  try {
    const { amount, collect_ref, display_name, txn_note, idempotency_key } =
      req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: "Invalid amount" });
    }

    const body = { amount: Number(amount) };
    if (collect_ref) body.collect_ref = collect_ref;
    if (display_name) body.display_name = display_name;
    if (txn_note) body.txn_note = txn_note;

    const method = "collect";
    const { signature, timestamp, nonce } = signRequest(NP_KEY, NP_SALT, method, body);
    const headers = buildHeaders(
      NP_KEY,
      timestamp,
      nonce,
      signature,
      idempotency_key,
    );

    const url = `${NP_API_BASE}/api/v2/payments/nsdl/collect`;
    const requestBody = JSON.stringify(body);

    console.log("===== 19PAY REQUEST =====");
    console.log("URL:", url);
    console.log("Headers:", JSON.stringify(headers, null, 2));
    console.log("Body:", requestBody);
    console.log("=========================");

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: requestBody,
    });

    const responseText = await response.text();

    console.log("===== 19PAY RESPONSE =====");
    console.log("Status:", response.status, response.statusText);
    console.log("Headers:", JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));
    console.log("Body:", responseText);
    console.log("==========================");

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { message: responseText };
    }

    if (!response.ok || !data.success) {
      console.error("19Pay collect error:", data);
      return res.status(response.status).json({
        success: false,
        error: data.message || "Payment creation failed",
      });
    }

    return res.json({
      success: true,
      checkoutUrl: data.checkoutUrl,
      transactionId: data.transactionEd,
      collectRef: data.collectRef,
    });
  } catch (err) {
    console.error("create-payment error:", err);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
});

// ─── POST /api/payment-webhook ──────────────────────────────────
app.post("/api/payment-webhook", async (req, res) => {
  try {
    const timestamp = req.headers["x-tsp-timestamp"] || "";
    const signature = req.headers["x-tsp-signature"] || "";
    const rawBody = req.body.toString("utf8");

    if (!timestamp || !signature) {
      return res.status(401).send("Missing signature headers");
    }

    // Verify HMAC signature
    const data = timestamp + "." + rawBody;
    const expected = crypto
      .createHmac("sha256", NP_WEBHOOK_SECRET)
      .update(data)
      .digest("hex");

    if (
      expected.length !== signature.length ||
      !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
    ) {
      console.error("Webhook signature verification failed");
      return res.status(401).send("Invalid signature");
    }

    const payload = JSON.parse(rawBody);
    console.log("Webhook payload:", payload);

    const collectRef =
      payload.collect_ref || payload.collectRef || payload.orderEd || "";
    const status = (payload.status || "").toUpperCase();

    let orderStatus = "pending";
    if (status === "SUCCESS" || status === "CAPTURED") orderStatus = "success";
    else if (
      status === "FAILED" ||
      status === "DECLINED" ||
      status === "CANCELLED"
    )
      orderStatus = "failed";

    // Update order in Supabase via the service role key
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseServiceKey) {
      await fetch(`${supabaseUrl}/rest/v1/orders?transaction_id=eq.${collectRef}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ status: orderStatus }),
      });
    }

    return res.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).send("Internal error");
  }
});

// ─── POST /api/payment-status ───────────────────────────────────
app.post("/api/payment-status", async (req, res) => {
  try {
    const { collect_refs } = req.body;

    if (!collect_refs || !Array.isArray(collect_refs) || !collect_refs.length) {
      return res
        .status(400)
        .json({ success: false, error: "collect_refs array required" });
    }

    const body = { collect_ref_or: collect_refs };
    const method = "collect";
    const { signature, timestamp, nonce } = signRequest(NP_KEY, NP_SALT, method, body);
    const headers = buildHeaders(NP_KEY, timestamp, nonce, signature);

    const response = await fetch(
      `${NP_API_BASE}/api/v2/payments/nsdl/status`,
      { method: "POST", headers, body: JSON.stringify(body) },
    );

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    console.error("payment-status error:", err);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
});

// ─── Serve Vite build ───────────────────────────────────────────
app.use(express.static(join(__dirname, "dist")));
app.get("/{*splat}", (_req, res) => {
  res.sendFile(join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
