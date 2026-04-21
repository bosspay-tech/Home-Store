/**
 * 19Pay API V2 HMAC signing utility
 *
 * Signs requests per the V2 spec:
 *   stringToSign = apiKey + timestamp + nonce + JSON.stringify(body)
 *   signature    = HMAC-SHA256(salt, stringToSign).hex()
 */

export async function signRequest(
  apiKey: string,
  salt: string,
  body: Record<string, unknown>,
): Promise<{ signature: string; timestamp: string; nonce: string }> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonceBytes = new Uint8Array(16);
  crypto.getRandomValues(nonceBytes);
  const nonce = Array.from(nonceBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const stringToSign = apiKey + timestamp + nonce + JSON.stringify(body);

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

  return { signature, timestamp, nonce };
}

export function buildHeaders(
  apiKey: string,
  timestamp: string,
  nonce: string,
  signature: string,
  idempotencyKey?: string,
): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-API-KEY": apiKey,
    "X-Timestamp": timestamp,
    "X-Nonce": nonce,
    "X-Signature": signature,
  };
  if (idempotencyKey) {
    headers["X-Idempotency-Key"] = idempotencyKey;
  }
  return headers;
}
