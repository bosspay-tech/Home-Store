import type { Request } from "express";

function firstOrigin(value?: string): string | null {
  if (!value?.trim()) return null;
  const first = value.split(",")[0].trim();
  if (!first) return null;
  if (first.startsWith("http://") || first.startsWith("https://")) {
    return first.replace(/\/+$/, "");
  }
  return `https://${first.replace(/\/+$/, "")}`;
}

function isLocalhost(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host === "localhost" || host === "127.0.0.1" || host.endsWith(".local");
  } catch {
    return url.includes("localhost") || url.includes("127.0.0.1");
  }
}

function originFromRequest(req: Request): string | null {
  const forwardedProto = req.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const forwardedHost = req.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || req.get("host");
  if (!host) return null;

  const proto = forwardedProto || (req.secure ? "https" : "http");
  const origin = `${proto}://${host}`.replace(/\/+$/, "");
  if (isLocalhost(origin)) return null;
  return origin;
}

function resolveFromEnv(...keys: string[]): string | null {
  for (const key of keys) {
    const value = firstOrigin(process.env[key]);
    if (value && !isLocalhost(value)) return value;
  }
  return null;
}

/** Public API base (Easebuzz surl/furl must reach this host). */
export function resolveBridgePublicUrl(
  req: Request,
  fallbackPort = 3000,
): string {
  return (
    resolveFromEnv(
      "BRIDGE_PUBLIC_URL",
      "BRIDGE_BASE_URL",
      "COOLIFY_URL",
      "PUBLIC_URL",
      "APP_URL",
    ) ??
    originFromRequest(req) ??
    `http://localhost:${fallbackPort}`
  );
}

/** Storefront base (browser redirect after payment). */
export function resolveStorefrontUrl(req: Request): string {
  const coolifyFqdn = process.env.COOLIFY_FQDN?.split(",")[0]?.trim();
  const fromFqdn = coolifyFqdn ? `https://${coolifyFqdn.replace(/\/+$/, "")}` : null;

  return (
    resolveFromEnv("STOREFRONT_URL", "COOLIFY_URL", "PUBLIC_URL", "APP_URL") ??
    (fromFqdn && !isLocalhost(fromFqdn) ? fromFqdn : null) ??
    originFromRequest(req) ??
    "http://localhost:5173"
  );
}
