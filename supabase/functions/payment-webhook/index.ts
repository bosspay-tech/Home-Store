import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const WEBHOOK_SECRET = Deno.env.get("NP_WEBHOOK_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function verifySignature(
  body: string,
  timestamp: string,
  signature: string,
): Promise<boolean> {
  const encoder = new TextEncoder();
  const data = timestamp + "." + body;

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(WEBHOOK_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  const expectedHex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Constant-time comparison
  if (expectedHex.length !== signature.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expectedHex.length; i++) {
    mismatch |= expectedHex.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return mismatch === 0;
}

Deno.serve(async (req) => {
  // Webhooks are POST only, no CORS needed (server-to-server)
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const timestamp = req.headers.get("X-TSP-Timestamp") || "";
    const signature = req.headers.get("X-TSP-Signature") || "";
    const rawBody = await req.text();

    if (!timestamp || !signature) {
      return new Response("Missing signature headers", { status: 401 });
    }

    const valid = await verifySignature(rawBody, timestamp, signature);
    if (!valid) {
      console.error("Webhook signature verification failed");
      return new Response("Invalid signature", { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    console.log("Webhook payload:", payload);

    // Extract transaction details from the webhook payload
    // NSDL webhooks use the normalized escrow channel shape
    const collectRef =
      payload.collect_ref || payload.collectRef || payload.orderEd || "";
    const transactionId =
      payload.transactionEd || payload.transactionId || "";
    const status = (payload.status || "").toUpperCase();
    const amount = payload.amount || 0;

    // Map 19Pay status to our order status
    let orderStatus = "pending";
    if (status === "SUCCESS" || status === "CAPTURED") {
      orderStatus = "success";
    } else if (
      status === "FAILED" ||
      status === "DECLINED" ||
      status === "CANCELLED"
    ) {
      orderStatus = "failed";
    }

    // Update order in Supabase using the transaction_id we stored
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { error } = await supabase
      .from("orders")
      .update({
        status: orderStatus,
        payment_ref: collectRef,
        np_transaction_id: transactionId,
      })
      .eq("transaction_id", collectRef);

    if (error) {
      console.error("Supabase update error:", error);
      // Still return 200 so 19Pay doesn't retry endlessly
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return new Response("Internal error", { status: 500 });
  }
});
