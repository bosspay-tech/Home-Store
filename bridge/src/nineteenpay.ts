import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export interface NineteenPayConfig {
  apiKey: string;
  salt: string;
  webhookSecret: string;
  apiBase: string;
}

export interface NineteenPayPaymentParams {
  amount: number; // in rupees
  collectRef: string;
  userRef: string;
  displayName?: string;
  txnNote?: string;
  idempotencyKey?: string;
}

export function signRequest(apiKey: string, salt: string, body: unknown) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = randomBytes(16).toString('hex');
  const stringToSign = apiKey + timestamp + nonce + JSON.stringify(body);
  const signature = createHmac('sha256', salt)
    .update(stringToSign)
    .digest('hex');
  return { signature, timestamp, nonce };
}

export function buildHeaders(
  apiKey: string,
  timestamp: string,
  nonce: string,
  signature: string,
  idempotencyKey?: string,
) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-API-KEY': apiKey,
    'X-Timestamp': timestamp,
    'X-Nonce': nonce,
    'X-Signature': signature,
  };
  if (idempotencyKey) {
    headers['X-Idempotency-Key'] = idempotencyKey;
  }
  return headers;
}

/**
 * Make a Server-to-Server /collect call to 19Pay.
 */
export async function createNineteenPayCollect(
  config: NineteenPayConfig,
  params: NineteenPayPaymentParams,
): Promise<{ checkoutUrl: string; transactionId: string; collectRef: string }> {
  // Use customer phone (digits only), fall back to collect_ref
  let rawRef = (params.userRef || '').replace(/[^a-zA-Z0-9]/g, '');
  if (rawRef.length < 5) {
    rawRef = (params.collectRef || '').replace(/[^a-zA-Z0-9]/g, '');
  }
  if (rawRef.length < 5) {
    rawRef = 'guestuser';
  }

  const body: Record<string, unknown> = { 
    amount: Number(params.amount),
    collect_ref: params.collectRef,
    payer: { user_ref: rawRef }
  };
  
  if (params.displayName) body.display_name = params.displayName;
  if (params.txnNote) body.txn_note = params.txnNote;

  const { signature, timestamp, nonce } = signRequest(config.apiKey, config.salt, body);
  const headers = buildHeaders(
    config.apiKey,
    timestamp,
    nonce,
    signature,
    params.idempotencyKey,
  );

  const url = `${config.apiBase}/api/v2/payments/nsdl/collect`;

  const response = await fetch(url, {
    method: 'POST',
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
    const errorMsg = data.message || data.raw?.error || 'Payment creation failed';
    throw new Error(`19Pay collect error: ${errorMsg}`);
  }

  // Check for downstream NSDL errors in raw field
  if (data.raw?.error) {
    throw new Error(`19Pay NSDL raw error: ${data.raw.error}`);
  }

  const checkoutUrl = data.link || data.checkoutUrl;

  if (!checkoutUrl) {
    throw new Error('No checkout URL returned from 19Pay');
  }

  return {
    checkoutUrl,
    transactionId: data.transactionId,
    collectRef: data.collectRef,
  };
}

/**
 * Query 19Pay Status API for a single collectRef
 */
export async function queryNineteenPayStatus(
  config: NineteenPayConfig,
  collectRef: string,
): Promise<any> {
  const body = { collect_ref_or: [collectRef] };
  const { signature, timestamp, nonce } = signRequest(config.apiKey, config.salt, body);
  const headers = buildHeaders(config.apiKey, timestamp, nonce, signature);

  const url = `${config.apiBase}/api/v2/payments/nsdl/status`;
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to check status');
  }

  // The status API returns an array of transaction maps, optionally keyed or just a list
  // Usually { success: true, data: [{ collectRef, status, amount ... }] }
  // We need to return the details of the match.
  const transactions = data.data || [];
  const match = transactions.find((t: any) => t.collectRef === collectRef || t.collect_ref === collectRef);
  if (!match) {
    throw new Error('Transaction not found in 19Pay status response');
  }

  return match;
}

export function resolveNineteenPayStatus(statusString?: string): 'success' | 'failed' | 'pending' {
  const status = (statusString || '').toUpperCase();
  if (status === 'SUCCESS' || status === 'CAPTURED') return 'success';
  if (status === 'FAILED' || status === 'DECLINED' || status === 'CANCELLED') return 'failed';
  return 'pending';
}

export function verifyNineteenPayWebhook(
  config: NineteenPayConfig,
  timestamp: string,
  signature: string,
  rawBody: string,
): { valid: boolean; payload?: any } {
  if (!timestamp || !signature) {
    return { valid: false };
  }

  const data = timestamp + '.' + rawBody;
  const expected = createHmac('sha256', config.webhookSecret)
    .update(data)
    .digest('hex');

  if (
    expected.length !== signature.length ||
    !timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  ) {
    return { valid: false };
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return { valid: false };
  }

  return { valid: true, payload };
}
