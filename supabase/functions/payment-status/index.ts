import { signRequest, buildHeaders } from "../_shared/hmac.ts";
import { corsHeaders } from "../_shared/cors.ts";

const NP_KEY = Deno.env.get("NP_KEY")!;
const NP_SALT = Deno.env.get("NP_SALT")!;
const NP_API_BASE =
  Deno.env.get("NP_API_BASE") || "https://nineteenapis.online";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { collect_refs } = await req.json();

    if (!collect_refs || !Array.isArray(collect_refs) || !collect_refs.length) {
      return new Response(
        JSON.stringify({ success: false, error: "collect_refs array required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const body: Record<string, unknown> = { collect_ref_or: collect_refs };
    const method = "collect";
    const { signature, timestamp } = await signRequest(
      NP_KEY,
      NP_SALT,
      method,
      body,
    );
    const headers = buildHeaders(NP_KEY, method, timestamp, signature);

    const response = await fetch(
      `${NP_API_BASE}/api/v2/payments/nsdl/status`,
      { method: "POST", headers, body: JSON.stringify(body) },
    );

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("payment-status error:", err);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
