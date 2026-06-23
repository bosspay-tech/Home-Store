const configuredSiteUrl = import.meta.env.VITE_SITE_URL?.trim().replace(/\/+$/, "");

function isLocalhostUrl(url) {
  if (!url) return false;
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host === "localhost" || host === "127.0.0.1" || host.endsWith(".local");
  } catch {
    return /localhost|127\.0\.0\.1/i.test(url);
  }
}

/** Public storefront origin for auth email links and redirects. */
export function getSiteUrl() {
  if (typeof window !== "undefined" && window.location?.origin) {
    const origin = window.location.origin.replace(/\/+$/, "");
    if (!isLocalhostUrl(origin)) return origin;
    if (configuredSiteUrl && !isLocalhostUrl(configuredSiteUrl)) {
      return configuredSiteUrl;
    }
    return origin;
  }

  return configuredSiteUrl || "";
}

/** Where Supabase should send users after email confirmation / magic links. */
export function getAuthRedirectUrl(path = "/auth/callback") {
  const base = getSiteUrl();
  if (!base) return undefined;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}
