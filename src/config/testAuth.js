/** Dev-only test account that skips email OTP (must match bridge TESTE). */
export const TEST_EMAIL = (import.meta.env.VITE_TESTE || "")
  .trim()
  .toLowerCase();

export function isTestEmail(email) {
  if (!TEST_EMAIL) return false;
  return String(email || "").trim().toLowerCase() === TEST_EMAIL;
}
