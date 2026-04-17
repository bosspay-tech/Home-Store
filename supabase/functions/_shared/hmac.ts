/**
 * 19Pay API V2 HMAC signing utility
 *
 * Signs requests per the V2 spec:
 *   stringToSign = apiKey + timestamp + method + JSON.stringify(sortedBody)
 *   signature    = HMAC-SHA256(salt, stringToSign).hex()
 */

function sortObject(obj: Record<string, unknown>): Record<string, unknown> {
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(obj).sort()) {
    sorted[key] = obj[key];
  }
  return sorted;
}

export async function signRequest(
  apiKey: string,
  salt: string,
  method: string,
  body: Record<string, unknown>,
): Promise<{ signature: string; timestamp: string }> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const sortedBody = sortObject(body);
  const stringToSign = apiKey + timestamp + method + JSON.stringify(sortedBody);

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(salt),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(stringToSign));
  const signature = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return { signature, timestamp };
}

export function buildHeaders(
  apiKey: string,
  method: string,
  timestamp: string,
  signature: string,
  idempotencyKey?: string,
): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-NP-KEY": apiKey,
    "X-Timestamp": timestamp,
    "X-Method": method,
    "X-Signature": signature,
  };
  if (idempotencyKey) {
    headers["X-Idempotency-Key"] = idempotencyKey;
  }
  return headers;
}
