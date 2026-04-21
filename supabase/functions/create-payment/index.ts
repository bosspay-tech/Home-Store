import { signRequest, buildHeaders } from "../_shared/hmac.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Satisfy standard TypeScript language server if Deno extension is not active
declare const Deno: any;

const NP_KEY = Deno.env.get("NP_KEY")!;
const NP_SALT = Deno.env.get("NP_SALT")!;
const NP_API_BASE =
  Deno.env.get("NP_API_BASE") || "https://nineteenapis.online";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { amount, collect_ref, display_name, txn_note, idempotency_key, user_ref } =
      await req.json();

    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid amount" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const body: Record<string, unknown> = { amount: Number(amount) };
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

    const { signature, timestamp, nonce } = await signRequest(
      NP_KEY,
      NP_SALT,
      body,
    );
    const headers = buildHeaders(
      NP_KEY,
      timestamp,
      nonce,
      signature,
      idempotency_key,
    );

    const response = await fetch(
      `${NP_API_BASE}/api/v2/payments/nsdl/collect`,
      { method: "POST", headers, body: JSON.stringify(body) },
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.error("19Pay collect error:", data);
      return new Response(
        JSON.stringify({
          success: false,
          error: data.message || "Payment creation failed",
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        checkoutUrl: data.checkoutUrl,
        transactionId: data.transactionEd,
        collectRef: data.collectRef,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("create-payment error:", err);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
